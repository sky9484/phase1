/// Hot-potato PaymentIntent module for atomic payment flows.
/// Phase 1 scaffold: USD-first amounts, atomic settlement, timeout handling.
module splash_protocol::payment_intent {
    use sui::tx_context::TxContext;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::object::{Self, UID};
    use std::string::{Self, String};
    use std::option::{Self, Option};

    /// PaymentIntent struct representing an atomic payment flow
    struct PaymentIntent has key, store {
        id: UID,
        sender: address,
        recipient: address,
        amount_usd: u64,
        target_currency: String,
        fx_rate_usd_local: u64, // Scaled by 1e6
        created_at: u64,
        expires_at: u64,
        status: u8, // 0: pending, 1: confirmed, 2: expired, 3: failed
    }

    /// Create a new PaymentIntent
    public entry fun create_payment_intent(
        sender: address,
        recipient: address,
        amount_usd: u64,
        target_currency: String,
        fx_rate_usd_local: u64,
        ctx: &mut TxContext
    ) {
        let now = tx_context::epoch_timestamp_ms(ctx);
        let expires_at = now + 300000; // 5 minutes

        let intent = PaymentIntent {
            id: object::new(ctx),
            sender,
            recipient,
            amount_usd,
            target_currency,
            fx_rate_usd_local,
            created_at: now,
            expires_at,
            status: 0, // pending
        };

        transfer::share_object(intent);
    }

    /// Confirm and execute the PaymentIntent (hot-potato)
    public entry fun confirm_payment_intent(
        intent: &mut PaymentIntent,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(intent.status == 0, 0); // Must be pending
        assert!(tx_context::epoch_timestamp_ms(ctx) < intent.expires_at, 1); // Not expired

        let amount = coin::value(&payment);
        assert!(amount >= intent.amount_usd, 2); // Sufficient payment

        intent.status = 1; // confirmed

        // Transfer payment to recipient (simplified - in production, convert to local currency)
        transfer::public_transfer(payment, intent.recipient);
    }

    /// Cancel expired PaymentIntent
    public entry fun cancel_payment_intent(intent: &mut PaymentIntent, ctx: &mut TxContext) {
        assert!(tx_context::epoch_timestamp_ms(ctx) >= intent.expires_at, 3); // Must be expired
        intent.status = 2; // expired
    }
}
