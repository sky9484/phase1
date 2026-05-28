/// SmartTreasury module for treasury management and rebalancing.
/// Phase 1 scaffold: USD-first treasury, liquidity management, rebalancing.
module splash_protocol::smart_treasury {
    use sui::tx_context::TxContext;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::object::{Self, UID};
    use std::string::String;
    use std::option::{Self, Option};

    /// SmartTreasury struct managing treasury assets
    struct SmartTreasury has key, store {
        id: UID,
        treasury_id: String,
        usdc_balance: u64,
        usd_balance: u64,
        last_rebalanced_at: u64,
        admin: address,
    }

    /// TreasuryRebalance struct for tracking rebalance operations
    struct TreasuryRebalance has key, store {
        id: UID,
        treasury_id: String,
        amount_usd: u64,
        direction: u8, // 0: deposit, 1: withdraw
        rebalanced_at: u64,
        operator: address,
    }

    /// Initialize SmartTreasury
    public entry fun init_treasury(
        treasury_id: String,
        admin: address,
        ctx: &mut TxContext
    ) {
        let treasury = SmartTreasury {
            id: object::new(ctx),
            treasury_id,
            usdc_balance: 0,
            usd_balance: 0,
            last_rebalanced_at: tx_context::epoch_timestamp_ms(ctx),
            admin,
        };

        transfer::share_object(treasury);
    }

    /// Add USDC to treasury
    public entry fun add_usdc(
        treasury: &mut SmartTreasury,
        usdc_coin: Coin<SUI>, // Simplified - in production use actual USDC type
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == treasury.admin, 0); // Admin only
        let amount = coin::value(&usdc_coin);
        treasury.usdc_balance = treasury.usdc_balance + amount;
        treasury.last_rebalanced_at = tx_context::epoch_timestamp_ms(ctx);
        coin::destroy_zero(usdc_coin);
    }

    /// Rebalance treasury (USD ↔ USDC)
    public entry fun rebalance_treasury(
        treasury: &mut SmartTreasury,
        amount_usd: u64,
        direction: u8,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == treasury.admin, 0); // Admin only

        if (direction == 0) {
            // Deposit USD to treasury
            treasury.usd_balance = treasury.usd_balance + amount_usd;
        } else {
            // Withdraw USD from treasury
            assert!(treasury.usd_balance >= amount_usd, 1); // Sufficient balance
            treasury.usd_balance = treasury.usd_balance - amount_usd;
        }

        treasury.last_rebalanced_at = tx_context::epoch_timestamp_ms(ctx);

        let rebalance = TreasuryRebalance {
            id: object::new(ctx),
            treasury_id: treasury.treasury_id,
            amount_usd,
            direction,
            rebalanced_at: tx_context::epoch_timestamp_ms(ctx),
            operator: tx_context::sender(ctx),
        };

        transfer::share_object(rebalance);
    }

    /// Get treasury balance
    public fun get_balance(treasury: &SmartTreasury): (u64, u64) {
        (treasury.usdc_balance, treasury.usd_balance)
    }
}
