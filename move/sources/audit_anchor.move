/// AuditAnchor module for immutable audit trail anchoring.
/// Phase 1 scaffold: Anchors audit hashes to Sui for immutability.
module splash_protocol::audit_anchor {
    use sui::tx_context::TxContext;
    use sui::object::{Self, UID};
    use sui::transfer;
    use std::string::String;
    use std::vector;

    /// AuditAnchor struct representing an anchored audit record
    struct AuditAnchor has key, store {
        id: UID,
        audit_hash: String,
        anchor_id: String,
        anchored_at: u64,
        anchorer: address,
    }

    /// Anchor an audit hash to Sui
    public entry fun anchor_audit_hash(
        audit_hash: String,
        anchor_id: String,
        ctx: &mut TxContext
    ) {
        let anchor = AuditAnchor {
            id: object::new(ctx),
            audit_hash,
            anchor_id,
            anchored_at: tx_context::epoch_timestamp_ms(ctx),
            anchorer: tx_context::sender(ctx),
        };

        transfer::share_object(anchor);
    }

    /// Verify an audit anchor exists (read-only)
    public fun verify_anchor(anchor: &AuditAnchor, audit_hash: String): bool {
        anchor.audit_hash == audit_hash
    }
}
