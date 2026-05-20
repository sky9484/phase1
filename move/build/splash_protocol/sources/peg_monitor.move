module splash_protocol::peg_monitor;

use splash_protocol::business_account::AdminCap;
use sui::clock::{Self, Clock};
use sui::event;

const E_USDC_DEPEGGED: u64 = 700;
const E_USDT_DEPEGGED: u64 = 701;
const E_PRICE_STALE: u64 = 702;
const PRICE_SCALE: u64 = 1_000_000;
const MAX_DEVIATION_BPS: u64 = 30;
const WARN_DEVIATION_BPS: u64 = 15;
const BPS_DENOMINATOR: u64 = 10_000;
const MAX_STALENESS_MS: u64 = 60_000;

public struct PegState has key {
    id: UID,
    usdc_price: u64,
    usdt_price: u64,
    updated_at_ms: u64,
    block_count: u64,
}

public struct PriceUpdated has copy, drop {
    usdc_price: u64,
    usdt_price: u64,
    updated_at_ms: u64,
}

public struct SettlementBlocked has copy, drop {
    coin: vector<u8>,
    price: u64,
    deviation_bps: u64,
    timestamp_ms: u64,
}

public struct PegCheckPassed has copy, drop {
    usdc_price: u64,
    usdt_price: u64,
    timestamp_ms: u64,
}

public fun create(_: &AdminCap, ctx: &mut TxContext) {
    let state = PegState {
        id: object::new(ctx),
        usdc_price: PRICE_SCALE,
        usdt_price: PRICE_SCALE,
        updated_at_ms: 0,
        block_count: 0,
    };

    transfer::share_object(state);
}

public fun update_price(_: &AdminCap, state: &mut PegState, price_usdc: u64, price_usdt: u64, clock: &Clock) {
    let now_ms = clock::timestamp_ms(clock);

    state.usdc_price = price_usdc;
    state.usdt_price = price_usdt;
    state.updated_at_ms = now_ms;

    event::emit(PriceUpdated {
        usdc_price: price_usdc,
        usdt_price: price_usdt,
        updated_at_ms: now_ms,
    });
}

public fun assert_peg_ok(state: &mut PegState, clock: &Clock) {
    let now_ms = clock::timestamp_ms(clock);
    assert_fresh(state, now_ms);

    let usdc_deviation_bps = deviation_bps(state.usdc_price);
    if (usdc_deviation_bps > MAX_DEVIATION_BPS) {
        state.block_count = state.block_count + 1;
        event::emit(SettlementBlocked {
            coin: b"USDC",
            price: state.usdc_price,
            deviation_bps: usdc_deviation_bps,
            timestamp_ms: now_ms,
        });
        abort E_USDC_DEPEGGED
    };

    let usdt_deviation_bps = deviation_bps(state.usdt_price);
    if (usdt_deviation_bps > MAX_DEVIATION_BPS) {
        state.block_count = state.block_count + 1;
        event::emit(SettlementBlocked {
            coin: b"USDT",
            price: state.usdt_price,
            deviation_bps: usdt_deviation_bps,
            timestamp_ms: now_ms,
        });
        abort E_USDT_DEPEGGED
    };

    event::emit(PegCheckPassed {
        usdc_price: state.usdc_price,
        usdt_price: state.usdt_price,
        timestamp_ms: now_ms,
    });
}

public fun assert_usdc_ok(state: &mut PegState, clock: &Clock) {
    let now_ms = clock::timestamp_ms(clock);
    assert_fresh(state, now_ms);

    let usdc_deviation_bps = deviation_bps(state.usdc_price);
    if (usdc_deviation_bps > MAX_DEVIATION_BPS) {
        state.block_count = state.block_count + 1;
        event::emit(SettlementBlocked {
            coin: b"USDC",
            price: state.usdc_price,
            deviation_bps: usdc_deviation_bps,
            timestamp_ms: now_ms,
        });
        abort E_USDC_DEPEGGED
    };

    event::emit(PegCheckPassed {
        usdc_price: state.usdc_price,
        usdt_price: state.usdt_price,
        timestamp_ms: now_ms,
    });
}

public fun deviation_bps(price: u64): u64 {
    let delta = if (price >= PRICE_SCALE) { price - PRICE_SCALE } else { PRICE_SCALE - price };

    delta * BPS_DENOMINATOR / PRICE_SCALE
}

public fun peg_zone(state: &PegState): u8 {
    let usdc_deviation_bps = deviation_bps(state.usdc_price);
    let usdt_deviation_bps = deviation_bps(state.usdt_price);
    let max_deviation_bps = if (usdc_deviation_bps >= usdt_deviation_bps) { usdc_deviation_bps } else { usdt_deviation_bps };

    if (max_deviation_bps > MAX_DEVIATION_BPS) {
        2
    } else if (max_deviation_bps > WARN_DEVIATION_BPS) {
        1
    } else {
        0
    }
}

public fun usdc_price(state: &PegState): u64 {
    state.usdc_price
}

public fun usdt_price(state: &PegState): u64 {
    state.usdt_price
}

public fun updated_at_ms(state: &PegState): u64 {
    state.updated_at_ms
}

public fun block_count(state: &PegState): u64 {
    state.block_count
}

public fun is_peg_healthy(state: &PegState, clock: &Clock): bool {
    let now_ms = clock::timestamp_ms(clock);
    let fresh = state.updated_at_ms == 0 || now_ms >= state.updated_at_ms && now_ms - state.updated_at_ms < MAX_STALENESS_MS;

    fresh && deviation_bps(state.usdc_price) <= MAX_DEVIATION_BPS && deviation_bps(state.usdt_price) <= MAX_DEVIATION_BPS
}

public fun acceptable_range(): (u64, u64) {
    let delta = PRICE_SCALE * MAX_DEVIATION_BPS / BPS_DENOMINATOR;

    (PRICE_SCALE - delta, PRICE_SCALE + delta)
}

public fun price_scale(): u64 {
    PRICE_SCALE
}

public fun max_deviation_bps(): u64 {
    MAX_DEVIATION_BPS
}

public fun warn_deviation_bps(): u64 {
    WARN_DEVIATION_BPS
}

public fun max_staleness_ms(): u64 {
    MAX_STALENESS_MS
}

fun assert_fresh(state: &PegState, now_ms: u64) {
    if (state.updated_at_ms > 0) {
        assert!(now_ms >= state.updated_at_ms && now_ms - state.updated_at_ms < MAX_STALENESS_MS, E_PRICE_STALE);
    };
}
