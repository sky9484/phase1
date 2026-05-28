/// PaymentIntent — atomic payment flow with sender-bound authorization.
///
/// Replaces the Phase 1 scaffold which accepted a spoofable `sender`
/// argument (C-03), used the slow `epoch_timestamp_ms` for expiration
/// (H-01), allowed any third party to confirm a shared intent (H-02),
/// and over-charged the caller by forwarding the entire coin even when
/// it exceeded the requested amount (H-03).
///
/// Design:
///   * `sender` is always `tx_context::sender(ctx)` at creation — never an
///     argument.
///   * Confirmation requires `tx_context::sender == intent.sender`.
///   * Expiration uses `&Clock` (real wall-clock ms), not epoch boundaries.
///   * Overpay is refunded to the sender via `coin::split`.
///   * Named abort codes registered in `lib/server/sui-settlement.ts`.
module splash_protocol::payment_intent;

use std::string::String;
use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin};
use sui::event;
use sui::sui::SUI;

// ─── Abort codes ───────────────────────────────────────────────────────────
const E_NOT_PENDING:           u64 = 400;
const E_EXPIRED:               u64 = 401;
const E_INSUFFICIENT_PAYMENT:  u64 = 402;
const E_NOT_YET_EXPIRED:       u64 = 403;
const E_UNAUTHORIZED:          u64 = 404;
const E_INVALID_AMOUNT:        u64 = 405;

// ─── Constants ─────────────────────────────────────────────────────────────
/// 5-minute expiration window.
const EXPIRATION_WINDOW_MS: u64 = 300_000;

// ─── Status constants ──────────────────────────────────────────────────────
const STATUS_PENDING:   u8 = 0;
const STATUS_CONFIRMED: u8 = 1;
const STATUS_EXPIRED:   u8 = 2;
const STATUS_CANCELED:  u8 = 3;

public struct PaymentIntent has key {
    id: UID,
    sender: address,
    recipient: address,
    amount_usd: u64,
    target_currency: String,
    /// USD→local FX rate scaled by 1e6.
    fx_rate_usd_local: u64,
    created_at: u64,
    expires_at: u64,
    status: u8,
}

// ─── Events ────────────────────────────────────────────────────────────────

public struct IntentCreated has copy, drop {
    intent_id: address,
    sender: address,
    recipient: address,
    amount_usd: u64,
    target_currency: String,
    fx_rate_usd_local: u64,
    created_at: u64,
    expires_at: u64,
}

public struct IntentConfirmed has copy, drop {
    intent_id: address,
    sender: address,
    recipient: address,
    amount_paid: u64,
    overpay_refunded: u64,
    confirmed_at: u64,
}

public struct IntentCanceled has copy, drop {
    intent_id: address,
    sender: address,
    canceled_at: u64,
    reason: u8, // STATUS_EXPIRED (2) or STATUS_CANCELED (3)
}

// ─── Entry / public functions ──────────────────────────────────────────────

/// Create a new intent. `sender` is bound to `tx_context::sender(ctx)` —
/// no longer a caller-supplied argument (C-03 fix).
public fun create_payment_intent(
    recipient: address,
    amount_usd: u64,
    target_currency: String,
    fx_rate_usd_local: u64,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(amount_usd > 0, E_INVALID_AMOUNT);

    let sender = tx_context::sender(ctx);
    let now = clock::timestamp_ms(clock);
    let expires_at = now + EXPIRATION_WINDOW_MS;

    let intent = PaymentIntent {
        id: object::new(ctx),
        sender,
        recipient,
        amount_usd,
        target_currency,
        fx_rate_usd_local,
        created_at: now,
        expires_at,
        status: STATUS_PENDING,
    };

    event::emit(IntentCreated {
        intent_id: object::uid_to_address(&intent.id),
        sender,
        recipient,
        amount_usd,
        target_currency: intent.target_currency,
        fx_rate_usd_local,
        created_at: now,
        expires_at,
    });

    transfer::share_object(intent);
}

/// Confirm an intent and execute payment. Only the original sender can call
/// (H-02 fix). Excess payment is split off and returned to the sender so the
/// recipient receives exactly `intent.amount_usd` (H-03 fix).
public fun confirm_payment_intent(
    intent: &mut PaymentIntent,
    mut payment: Coin<SUI>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let caller = tx_context::sender(ctx);
    assert!(caller == intent.sender, E_UNAUTHORIZED);
    assert!(intent.status == STATUS_PENDING, E_NOT_PENDING);
    assert!(clock::timestamp_ms(clock) < intent.expires_at, E_EXPIRED);

    let provided = coin::value(&payment);
    assert!(provided >= intent.amount_usd, E_INSUFFICIENT_PAYMENT);

    let overpay = provided - intent.amount_usd;

    // Split off the exact amount; refund the rest if any.
    let to_recipient = coin::split(&mut payment, intent.amount_usd, ctx);
    transfer::public_transfer(to_recipient, intent.recipient);

    if (overpay > 0) {
        transfer::public_transfer(payment, caller);
    } else {
        // `payment` is now zero-value; destroy it safely.
        coin::destroy_zero(payment);
    };

    intent.status = STATUS_CONFIRMED;

    event::emit(IntentConfirmed {
        intent_id: object::uid_to_address(&intent.id),
        sender: intent.sender,
        recipient: intent.recipient,
        amount_paid: intent.amount_usd,
        overpay_refunded: overpay,
        confirmed_at: clock::timestamp_ms(clock),
    });
}

/// Cancel an expired intent. Anyone can call after the deadline — the
/// state transition is idempotent and only flips the status to EXPIRED.
public fun cancel_payment_intent(
    intent: &mut PaymentIntent,
    clock: &Clock,
    _ctx: &mut TxContext,
) {
    assert!(intent.status == STATUS_PENDING, E_NOT_PENDING);
    let now = clock::timestamp_ms(clock);
    assert!(now >= intent.expires_at, E_NOT_YET_EXPIRED);

    intent.status = STATUS_EXPIRED;

    event::emit(IntentCanceled {
        intent_id: object::uid_to_address(&intent.id),
        sender: intent.sender,
        canceled_at: now,
        reason: STATUS_EXPIRED,
    });
}

/// Sender-initiated cancel before expiration. Only the original sender can call.
public fun cancel_by_sender(
    intent: &mut PaymentIntent,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(tx_context::sender(ctx) == intent.sender, E_UNAUTHORIZED);
    assert!(intent.status == STATUS_PENDING, E_NOT_PENDING);

    intent.status = STATUS_CANCELED;

    event::emit(IntentCanceled {
        intent_id: object::uid_to_address(&intent.id),
        sender: intent.sender,
        canceled_at: clock::timestamp_ms(clock),
        reason: STATUS_CANCELED,
    });
}

// ─── Views ─────────────────────────────────────────────────────────────────

public fun sender(intent: &PaymentIntent): address          { intent.sender }
public fun recipient(intent: &PaymentIntent): address       { intent.recipient }
public fun amount_usd(intent: &PaymentIntent): u64          { intent.amount_usd }
public fun status(intent: &PaymentIntent): u8               { intent.status }
public fun expires_at(intent: &PaymentIntent): u64          { intent.expires_at }
public fun target_currency(intent: &PaymentIntent): &String { &intent.target_currency }

public fun is_expired(intent: &PaymentIntent, clock: &Clock): bool {
    clock::timestamp_ms(clock) >= intent.expires_at
}
