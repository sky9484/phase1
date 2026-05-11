module splash_protocol::dual_treasury;

use splash_protocol::business_account::AdminCap;
use sui::balance::{Self, Balance};
use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin};
use sui::event;

const E_USDT_TTL_EXCEEDED: u64 = 600;
const E_USDT_BUFFER_EMPTY: u64 = 601;
const E_USDT_SWEEP_TOO_EARLY: u64 = 602;
const E_USDT_INSUFFICIENT_KYC_TIER: u64 = 603;
const E_USDT_INSUFFICIENT_BALANCE: u64 = 604;
const USDT_MAX_HOLD_MS: u64 = 1_800_000;
const USDT_SWEEP_TRIGGER_MS: u64 = 1_620_000;

public struct UsdtBuffer<phantom USDT> has key {
    id: UID,
    balance: Balance<USDT>,
    intake_ms: u64,
    intake_amount: u64,
}

public struct UsdtDeposited has copy, drop {
    amount: u64,
    intake_ms: u64,
    expires_at_ms: u64,
}

public struct UsdtSettled has copy, drop {
    payout_id: vector<u8>,
    amount: u64,
    age_ms: u64,
    recipient: address,
}

public struct UsdtSwept has copy, drop {
    amount: u64,
    age_ms: u64,
}

public fun create_buffer<USDT>(_: &AdminCap, ctx: &mut TxContext): UsdtBuffer<USDT> {
    UsdtBuffer {
        id: object::new(ctx),
        balance: balance::zero(),
        intake_ms: 0,
        intake_amount: 0,
    }
}

public fun deposit<USDT>(
    buffer: &mut UsdtBuffer<USDT>,
    coin: Coin<USDT>,
    clock: &Clock,
    cap: &AdminCap,
) {
    let _ = cap;
    let amount = coin::value(&coin);
    let now_ms = clock::timestamp_ms(clock);

    balance::join(&mut buffer.balance, coin::into_balance(coin));
    buffer.intake_ms = now_ms;
    buffer.intake_amount = buffer.intake_amount + amount;

    event::emit(UsdtDeposited {
        amount,
        intake_ms: now_ms,
        expires_at_ms: now_ms + USDT_MAX_HOLD_MS,
    });
}

public fun settle_usdt<USDT>(
    buffer: &mut UsdtBuffer<USDT>,
    cap: &AdminCap,
    recipient: address,
    amount: u64,
    payout_id: vector<u8>,
    kyc_tier: u8,
    min_kyc_tier: u8,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let _ = cap;
    assert!(kyc_tier >= min_kyc_tier, E_USDT_INSUFFICIENT_KYC_TIER);

    let age_ms = clock::timestamp_ms(clock) - buffer.intake_ms;
    assert!(age_ms < USDT_MAX_HOLD_MS, E_USDT_TTL_EXCEEDED);
    assert!(balance::value(&buffer.balance) >= amount, E_USDT_INSUFFICIENT_BALANCE);

    let coin = coin::from_balance(balance::split(&mut buffer.balance, amount), ctx);
    transfer::public_transfer(coin, recipient);

    event::emit(UsdtSettled { payout_id, amount, age_ms, recipient });
}

public fun emergency_sweep<USDT>(
    buffer: &mut UsdtBuffer<USDT>,
    cap: &AdminCap,
    recipient: address,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let _ = cap;
    let age_ms = clock::timestamp_ms(clock) - buffer.intake_ms;
    assert!(age_ms >= USDT_SWEEP_TRIGGER_MS, E_USDT_SWEEP_TOO_EARLY);

    let amount = balance::value(&buffer.balance);
    assert!(amount > 0, E_USDT_BUFFER_EMPTY);

    let coin = coin::from_balance(balance::split(&mut buffer.balance, amount), ctx);
    event::emit(UsdtSwept { amount, age_ms });
    transfer::public_transfer(coin, recipient);
}

public fun usdt_balance<USDT>(buffer: &UsdtBuffer<USDT>): u64 {
    balance::value(&buffer.balance)
}

public fun usdt_age_ms<USDT>(buffer: &UsdtBuffer<USDT>, clock: &Clock): u64 {
    if (buffer.intake_ms == 0) { 0 } else { clock::timestamp_ms(clock) - buffer.intake_ms }
}

public fun ttl_remaining_ms<USDT>(buffer: &UsdtBuffer<USDT>, clock: &Clock): u64 {
    let age = usdt_age_ms(buffer, clock);
    if (age >= USDT_MAX_HOLD_MS) { 0 } else { USDT_MAX_HOLD_MS - age }
}

public fun sweep_trigger_ms(): u64 {
    USDT_SWEEP_TRIGGER_MS
}

public fun max_hold_ms(): u64 {
    USDT_MAX_HOLD_MS
}
