/// Anchor — a digest of off-chain evidence, frozen on chain.
///
/// One anchor per thing Splash wants to be able to prove later: a USDC
/// transfer's receipt, an issued invoice, a corridor payout's confirmation, a
/// verification decision. The anchor carries the SHA-256 of the evidence and
/// nothing else about it. Amount, counterparty, currency, memo, bank — none of
/// it is here, because an anchor is public forever and the WS5 rule is that
/// nothing about the payment itself may be.
///
/// Two ways to anchor:
///
///   * `anchor` — permissionless. Anyone may anchor any digest. An indexer
///     decides whose anchors it trusts by `anchored_by`, exactly as it decides
///     whose signatures it trusts. This is the path for a record Splash makes
///     about its own decisions (a verification, a limit change).
///   * `anchor_for` — bound to an evidence bundle's `Allowlist`. The sender must
///     be a party to that bundle, so a third party cannot attach a false anchor
///     to somebody else's payment. This is the path for receipts and invoices.
///
/// Anchors are frozen, not shared: nobody can change one, including Splash,
/// and reading one costs nothing. `splash_core`'s `audit_anchor` remains the
/// settlement-receipt path once core publishes; this module is the evidence
/// path that exists before it and beside it.
module splash_evidence::anchor;

use splash_evidence::allowlist::{Self, Allowlist};
use sui::clock::Clock;
use sui::event;

// ─── Abort codes ───────────────────────────────────────────────────────────
const E_BAD_DIGEST: u64 = 720;
const E_NOT_A_PARTY: u64 = 721;
const E_UNKNOWN_KIND: u64 = 722;

/// A digest is SHA-256, always. A different length is a bug upstream, not a
/// different hash function, so it aborts rather than being stored.
const DIGEST_BYTES: u64 = 32;

// ─── Kinds ─────────────────────────────────────────────────────────────────
// Numbers, not strings, so the set is closed and an indexer can switch on it.
// Add at the end; never renumber.
const KIND_USDC_TRANSFER: u8 = 1;
const KIND_INVOICE: u8 = 2;
const KIND_CORRIDOR_PAYOUT: u8 = 3;
const KIND_VERIFICATION: u8 = 4;
const KIND_MAX: u8 = 4;

public fun kind_usdc_transfer(): u8 { KIND_USDC_TRANSFER }
public fun kind_invoice(): u8 { KIND_INVOICE }
public fun kind_corridor_payout(): u8 { KIND_CORRIDOR_PAYOUT }
public fun kind_verification(): u8 { KIND_VERIFICATION }

// ─── Object ────────────────────────────────────────────────────────────────

public struct Anchor has key {
    id: UID,
    kind: u8,
    digest: vector<u8>,
    /// The evidence bundle this anchor belongs to, when bound to one.
    bundle: Option<ID>,
    anchored_by: address,
    anchored_at_ms: u64,
}

// ─── Event ─────────────────────────────────────────────────────────────────

public struct EvidenceAnchored has copy, drop {
    anchor: ID,
    kind: u8,
    digest: vector<u8>,
    bundle: Option<ID>,
    anchored_by: address,
    anchored_at_ms: u64,
}

// ─── Anchoring ─────────────────────────────────────────────────────────────

/// Anchor a digest with no bundle. Permissionless; trust is by `anchored_by`.
public fun anchor(kind: u8, digest: vector<u8>, clock: &Clock, ctx: &mut TxContext): ID {
    freeze_anchor(kind, digest, option::none(), clock, ctx)
}

/// Anchor a digest for an evidence bundle. The sender must be a party to it —
/// a member of its allowlist — so nobody can pin a false record to somebody
/// else's payment. Grants do not count: an auditor may read, not write.
public fun anchor_for(
    kind: u8,
    digest: vector<u8>,
    bundle: &Allowlist,
    clock: &Clock,
    ctx: &mut TxContext,
): ID {
    assert!(allowlist::members(bundle).contains(&ctx.sender()), E_NOT_A_PARTY);
    freeze_anchor(kind, digest, option::some(object::id(bundle)), clock, ctx)
}

entry fun anchor_entry(kind: u8, digest: vector<u8>, clock: &Clock, ctx: &mut TxContext) {
    let _ = anchor(kind, digest, clock, ctx);
}

entry fun anchor_for_entry(
    kind: u8,
    digest: vector<u8>,
    bundle: &Allowlist,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let _ = anchor_for(kind, digest, bundle, clock, ctx);
}

fun freeze_anchor(
    kind: u8,
    digest: vector<u8>,
    bundle: Option<ID>,
    clock: &Clock,
    ctx: &mut TxContext,
): ID {
    assert!(kind >= KIND_USDC_TRANSFER && kind <= KIND_MAX, E_UNKNOWN_KIND);
    assert!(digest.length() == DIGEST_BYTES, E_BAD_DIGEST);
    let anchored_by = ctx.sender();
    let anchored_at_ms = clock.timestamp_ms();
    let anchor = Anchor {
        id: object::new(ctx),
        kind,
        digest,
        bundle,
        anchored_by,
        anchored_at_ms,
    };
    let id = object::id(&anchor);
    event::emit(EvidenceAnchored { anchor: id, kind, digest, bundle, anchored_by, anchored_at_ms });
    transfer::freeze_object(anchor);
    id
}

// ─── Views ─────────────────────────────────────────────────────────────────

public fun kind(anchor: &Anchor): u8 { anchor.kind }
public fun digest(anchor: &Anchor): &vector<u8> { &anchor.digest }
public fun bundle(anchor: &Anchor): Option<ID> { anchor.bundle }
public fun anchored_by(anchor: &Anchor): address { anchor.anchored_by }
public fun anchored_at_ms(anchor: &Anchor): u64 { anchor.anchored_at_ms }

/// True when `expected` is the digest this anchor commits to. A view, so that
/// a verifier's check is the same code the anchor was written with.
public fun matches(anchor: &Anchor, expected: vector<u8>): bool {
    anchor.digest == expected
}
