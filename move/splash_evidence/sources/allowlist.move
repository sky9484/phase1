/// Allowlist — the Seal access policy for one evidence bundle.
///
/// An evidence bundle is everything Splash keeps about one payment that a
/// counterparty or an auditor may need to see: the issued invoice, the
/// receipt, the corridor partner's confirmation. It is encrypted with Seal and
/// stored on Walrus; this object says who may decrypt it.
///
/// Seal's contract with a policy module is one function, `seal_approve`. A key
/// server dry-runs it with the requester as the transaction sender and the
/// identity bytes the ciphertext was encrypted to; if it does not abort, the
/// server hands over its key share. Everything else here exists to decide what
/// that one function returns.
///
/// Who is on a list, and why each rule is there:
///
///   * `members` — the parties to the payment: the issuer's wallet, the payer's,
///     the recipient's, and the corridor partner's when one is involved. They
///     are added by whoever holds the list's `Cap`, which is the issuer.
///   * `grants` — time-boxed access for someone who is NOT a party: an auditor,
///     a tax agent, a bank asking a question. A grant expires on its own, and
///     it is also revoked, every grant at once, the moment any member is
///     removed. A change in who is party to a payment is a change in who may
///     have been trusted, and a standing grant should not survive it. This is
///     the rule the canon calls "time-boxed auditor grants revoked by any
///     authority change".
///   * `namespace` — the identity bytes must begin with this list's object id,
///     so a ciphertext encrypted for one bundle cannot be opened by presenting
///     another bundle's list, however permissive.
///
/// What is NOT here: money, balances, or any capability over any account. This
/// module cannot move, freeze or approve anything. It answers yes or no to
/// "may this address read this bundle", and that is all.
module splash_evidence::allowlist;

use std::string::String;
use sui::clock::Clock;
use sui::event;

// ─── Abort codes ───────────────────────────────────────────────────────────
const E_NO_ACCESS: u64 = 700;
const E_WRONG_CAP: u64 = 701;
const E_DUPLICATE: u64 = 702;
const E_NOT_A_MEMBER: u64 = 703;
const E_INVALID_ADDRESS: u64 = 704;
const E_EXPIRY_IN_THE_PAST: u64 = 705;
const E_TOO_MANY: u64 = 706;

/// A list is small by design. Sixteen parties to one payment is already more
/// than any invoice has; the bound keeps `seal_approve` cheap to dry-run and
/// stops a list from becoming a public directory.
const MAX_MEMBERS: u64 = 16;
const MAX_GRANTS: u64 = 16;

// ─── Objects ───────────────────────────────────────────────────────────────

public struct Allowlist has key {
    id: UID,
    /// A label for people, never for policy. "INV-2026-000417", say.
    name: String,
    /// The parties to the payment.
    members: vector<address>,
    /// Time-boxed outsiders. Cleared whenever a member is removed.
    grants: vector<Grant>,
    /// Bumped by every change, so an indexer can tell two states apart.
    generation: u64,
}

public struct Grant has copy, drop, store {
    who: address,
    expires_ms: u64,
}

/// The right to change one list. Held by the issuer's wallet. `store` so it
/// can be created by a sponsor and handed to the wallet that will keep it.
public struct Cap has key, store {
    id: UID,
    allowlist_id: ID,
}

// ─── Events ────────────────────────────────────────────────────────────────
// Object ids and addresses only. No names, no amounts, no invoice numbers.

public struct AllowlistCreated has copy, drop {
    allowlist: ID,
    creator: address,
}

public struct MemberAdded has copy, drop {
    allowlist: ID,
    member: address,
    generation: u64,
}

public struct MemberRemoved has copy, drop {
    allowlist: ID,
    member: address,
    /// How many grants this removal revoked.
    grants_revoked: u64,
    generation: u64,
}

public struct GrantIssued has copy, drop {
    allowlist: ID,
    who: address,
    expires_ms: u64,
    generation: u64,
}

// ─── Create ────────────────────────────────────────────────────────────────

/// Create a list. The creator is its first member: a bundle is always readable
/// by the wallet that made it. Returns the `Cap`; the caller decides where it
/// lives (usually `transfer::public_transfer(cap, issuer_wallet)`).
public fun create(name: String, ctx: &mut TxContext): Cap {
    let creator = ctx.sender();
    let allowlist = Allowlist {
        id: object::new(ctx),
        name,
        members: vector[creator],
        grants: vector[],
        generation: 0,
    };
    let allowlist_id = object::id(&allowlist);
    let cap = Cap { id: object::new(ctx), allowlist_id };
    event::emit(AllowlistCreated { allowlist: allowlist_id, creator });
    transfer::share_object(allowlist);
    cap
}

/// The same, keeping the `Cap` with the sender. For wallets and scripts.
entry fun create_entry(name: String, ctx: &mut TxContext) {
    transfer::public_transfer(create(name, ctx), ctx.sender());
}

// ─── Membership ────────────────────────────────────────────────────────────

public fun add(allowlist: &mut Allowlist, cap: &Cap, member: address) {
    assert_cap(allowlist, cap);
    assert!(member != @0x0, E_INVALID_ADDRESS);
    assert!(!allowlist.members.contains(&member), E_DUPLICATE);
    assert!(allowlist.members.length() < MAX_MEMBERS, E_TOO_MANY);
    allowlist.members.push_back(member);
    allowlist.generation = allowlist.generation + 1;
    event::emit(MemberAdded {
        allowlist: object::id(allowlist),
        member,
        generation: allowlist.generation,
    });
}

/// Remove a member. Every grant is revoked with them: a change in the parties
/// to a payment invalidates the trust each grant was issued under.
public fun remove(allowlist: &mut Allowlist, cap: &Cap, member: address) {
    assert_cap(allowlist, cap);
    let (found, index) = allowlist.members.index_of(&member);
    assert!(found, E_NOT_A_MEMBER);
    allowlist.members.remove(index);
    let grants_revoked = allowlist.grants.length();
    allowlist.grants = vector[];
    allowlist.generation = allowlist.generation + 1;
    event::emit(MemberRemoved {
        allowlist: object::id(allowlist),
        member,
        grants_revoked,
        generation: allowlist.generation,
    });
}

/// Give an outsider access until `expires_ms`. Re-granting the same address
/// replaces the old expiry rather than stacking a second grant.
public fun grant(
    allowlist: &mut Allowlist,
    cap: &Cap,
    who: address,
    expires_ms: u64,
    clock: &Clock,
) {
    assert_cap(allowlist, cap);
    assert!(who != @0x0, E_INVALID_ADDRESS);
    assert!(expires_ms > clock.timestamp_ms(), E_EXPIRY_IN_THE_PAST);
    let existing = find_grant(allowlist, who);
    if (existing.is_some()) {
        allowlist.grants.remove(existing.destroy_some());
    } else {
        assert!(allowlist.grants.length() < MAX_GRANTS, E_TOO_MANY);
    };
    allowlist.grants.push_back(Grant { who, expires_ms });
    allowlist.generation = allowlist.generation + 1;
    event::emit(GrantIssued {
        allowlist: object::id(allowlist),
        who,
        expires_ms,
        generation: allowlist.generation,
    });
}

/// Revoke one grant early. Only the holder of the cap.
public fun revoke(allowlist: &mut Allowlist, cap: &Cap, who: address) {
    assert_cap(allowlist, cap);
    let existing = find_grant(allowlist, who);
    assert!(existing.is_some(), E_NOT_A_MEMBER);
    allowlist.grants.remove(existing.destroy_some());
    allowlist.generation = allowlist.generation + 1;
}

// ─── The Seal policy ───────────────────────────────────────────────────────

/// The identity prefix every ciphertext for this bundle is encrypted under.
/// Callers append their own nonce: `[namespace][nonce]`.
public fun namespace(allowlist: &Allowlist): vector<u8> {
    allowlist.id.to_bytes()
}

/// Seal calls this. It aborts unless `ctx.sender()` may read `id`.
///
/// Two checks, in order: the identity belongs to this list (prefix), and the
/// sender is a member or holds an unexpired grant. The order matters only for
/// the abort code an integrator sees; both must hold.
entry fun seal_approve(id: vector<u8>, allowlist: &Allowlist, clock: &Clock, ctx: &TxContext) {
    assert!(approve_internal(ctx.sender(), id, allowlist, clock.timestamp_ms()), E_NO_ACCESS);
}

/// The same decision, as a value, for tests and off-chain previews.
public fun can_read(allowlist: &Allowlist, who: address, id: vector<u8>, now_ms: u64): bool {
    approve_internal(who, id, allowlist, now_ms)
}

fun approve_internal(caller: address, id: vector<u8>, allowlist: &Allowlist, now_ms: u64): bool {
    if (!is_prefix(namespace(allowlist), id)) return false;
    if (allowlist.members.contains(&caller)) return true;
    let existing = find_grant(allowlist, caller);
    if (existing.is_none()) return false;
    let grant = &allowlist.grants[existing.destroy_some()];
    now_ms < grant.expires_ms
}

// ─── Views ─────────────────────────────────────────────────────────────────

public fun name(allowlist: &Allowlist): &String { &allowlist.name }
public fun members(allowlist: &Allowlist): &vector<address> { &allowlist.members }
public fun generation(allowlist: &Allowlist): u64 { allowlist.generation }
public fun grant_count(allowlist: &Allowlist): u64 { allowlist.grants.length() }
public fun cap_allowlist_id(cap: &Cap): ID { cap.allowlist_id }

// ─── Internals ─────────────────────────────────────────────────────────────

fun assert_cap(allowlist: &Allowlist, cap: &Cap) {
    assert!(cap.allowlist_id == object::id(allowlist), E_WRONG_CAP);
}

fun find_grant(allowlist: &Allowlist, who: address): Option<u64> {
    let mut i = 0;
    let n = allowlist.grants.length();
    while (i < n) {
        if (allowlist.grants[i].who == who) return option::some(i);
        i = i + 1;
    };
    option::none()
}

fun is_prefix(prefix: vector<u8>, word: vector<u8>): bool {
    if (prefix.length() > word.length()) return false;
    let mut i = 0;
    while (i < prefix.length()) {
        if (prefix[i] != word[i]) return false;
        i = i + 1;
    };
    true
}

// ─── Test helpers ──────────────────────────────────────────────────────────

#[test_only]
public fun is_prefix_for_testing(prefix: vector<u8>, word: vector<u8>): bool {
    is_prefix(prefix, word)
}
