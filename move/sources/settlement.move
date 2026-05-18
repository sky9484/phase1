module splash_protocol::settlement;

use splash_protocol::business_account::{Self, BusinessAccount};
use splash_protocol::peg_monitor::{Self, PegState};
use sui::clock::Clock;
use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::event;
use sui::sui::SUI;

const E_NOT_VERIFIED: u64 = 100;
const E_INSUFFICIENT_FUNDS: u64 = 101;
const E_EMPTY_BATCH: u64 = 102;
const FEE_BPS: u64 = 150;
const BPS_DENOMINATOR: u64 = 10_000;

public struct SettlementPool<phantom T> has key {
    id: UID,
    balance: Balance<T>,
    protocol_fees: Balance<T>,
}

public struct Payment has copy, drop, store {
    recipient: address,
    amount: u64,
}

public struct PaymentSettled has copy, drop {
    business_owner: address,
    recipient: address,
    gross_amount: u64,
    protocol_fee: u64,
    net_amount: u64,
}

public struct PaymentExecuted has copy, drop {
    business_owner: address,
    recipient: address,
    gross_amount: u64,
    protocol_fee: u64,
    net_amount: u64,
}

public fun new_payment(recipient: address, amount: u64): Payment {
    Payment { recipient, amount }
}

public fun create_pool<T>(ctx: &mut TxContext) {
    let pool = SettlementPool<T> {
        id: object::new(ctx),
        balance: balance::zero<T>(),
        protocol_fees: balance::zero<T>(),
    };

    transfer::share_object(pool);
}

public fun deposit<T>(pool: &mut SettlementPool<T>, coin: Coin<T>) {
    balance::join(&mut pool.balance, coin::into_balance(coin));
}

public fun settle_payment<T>(
    pool: &mut SettlementPool<T>,
    business_account: &BusinessAccount,
    peg_state: &PegState,
    payment: Coin<T>,
    recipient: address,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(business_account::is_verified(business_account), E_NOT_VERIFIED);
    peg_monitor::assert_pegged(peg_state, clock);

    let gross = coin::value(&payment);
    let fee = gross * FEE_BPS / BPS_DENOMINATOR;
    let net = gross - fee;

    assert!(net > 0, E_INSUFFICIENT_FUNDS);

    let mut payment_balance = coin::into_balance(payment);
    let fee_balance = balance::split(&mut payment_balance, fee);

    balance::join(&mut pool.protocol_fees, fee_balance);
    transfer::public_transfer(coin::from_balance(payment_balance, ctx), recipient);

    event::emit(PaymentSettled {
        business_owner: business_account::owner(business_account),
        recipient,
        gross_amount: gross,
        protocol_fee: fee,
        net_amount: net,
    });
}

public fun settle_batch<T>(
    pool: &mut SettlementPool<T>,
    business_account: &BusinessAccount,
    peg_state: &PegState,
    payments: vector<Payment>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(business_account::is_verified(business_account), E_NOT_VERIFIED);
    peg_monitor::assert_pegged(peg_state, clock);
    assert!(vector::length(&payments) > 0, E_EMPTY_BATCH);

    let business_owner = business_account::owner(business_account);
    let mut payments = payments;

    while (!vector::is_empty(&payments)) {
        let payment = vector::pop_back(&mut payments);
        let fee = payment.amount * FEE_BPS / BPS_DENOMINATOR;
        let net = payment.amount - fee;
        let fee_balance = balance::split(&mut pool.balance, fee);
        let payout_balance = balance::split(&mut pool.balance, net);

        balance::join(&mut pool.protocol_fees, fee_balance);
        transfer::public_transfer(coin::from_balance(payout_balance, ctx), payment.recipient);

        event::emit(PaymentExecuted {
            business_owner,
            recipient: payment.recipient,
            gross_amount: payment.amount,
            protocol_fee: fee,
            net_amount: net,
        });
    };
}

public fun settle_sui_batch(
    pool: &mut SettlementPool<SUI>,
    business_account: &BusinessAccount,
    peg_state: &PegState,
    payments: vector<Payment>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    settle_batch<SUI>(pool, business_account, peg_state, payments, clock, ctx);
}

public fun pool_balance<T>(pool: &SettlementPool<T>): u64 {
    balance::value(&pool.balance)
}

public fun protocol_fees<T>(pool: &SettlementPool<T>): u64 {
    balance::value(&pool.protocol_fees)
}
