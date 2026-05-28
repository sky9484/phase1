/// ReceiptV2 module for immutable receipts with USD-first amounts.
/// Phase 1 scaffold: Receipts with USD amounts, local currency display, audit anchoring.
module splash_protocol::receipt_v2 {
    use sui::tx_context::TxContext;
    use sui::object::{Self, UID};
    use sui::transfer;
    use std::string::String;
    use std::option::{Self, Option};

    /// ReceiptV2 struct representing an immutable settlement receipt
    struct ReceiptV2 has key, store {
        id: UID,
        receipt_id: String,
        sender: address,
        recipient: address,
        amount_usd: u64,
        target_currency: String,
        target_amount: u64,
        fx_rate_usd_local: u64, // Scaled by 1e6
        settled_at: u64,
        tx_digest: String,
        audit_anchor_id: Option<String>,
    }

    /// Create a new ReceiptV2
    public entry fun create_receipt(
        receipt_id: String,
        sender: address,
        recipient: address,
        amount_usd: u64,
        target_currency: String,
        target_amount: u64,
        fx_rate_usd_local: u64,
        tx_digest: String,
        audit_anchor_id: Option<String>,
        ctx: &mut TxContext
    ) {
        let receipt = ReceiptV2 {
            id: object::new(ctx),
            receipt_id,
            sender,
            recipient,
            amount_usd,
            target_currency,
            target_amount,
            fx_rate_usd_local,
            settled_at: tx_context::epoch_timestamp_ms(ctx),
            tx_digest,
            audit_anchor_id,
        };

        transfer::share_object(receipt);
    }

    /// Link an audit anchor to a receipt
    public entry fun link_audit_anchor(
        receipt: &mut ReceiptV2,
        audit_anchor_id: String,
        _ctx: &mut TxContext
    ) {
        receipt.audit_anchor_id = option::some(audit_anchor_id);
    }

    /// Get receipt details
    public fun get_receipt(receipt: &ReceiptV2): (String, address, address, u64, String, u64, u64) {
        (
            receipt.receipt_id,
            receipt.sender,
            receipt.recipient,
            receipt.amount_usd,
            receipt.target_currency,
            receipt.target_amount,
            receipt.fx_rate_usd_local,
        )
    }

    /// Verify receipt integrity
    public fun verify_receipt(receipt: &ReceiptV2, tx_digest: String): bool {
        receipt.tx_digest == tx_digest
    }
}
