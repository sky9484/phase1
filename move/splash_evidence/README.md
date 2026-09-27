# splash_evidence

The evidence layer. Publishes **before** `splash_core`, **upgradeable**, under the
cold multisig. Holds no value and has no power over any account.

| Module | What it decides | What it can never do |
|---|---|---|
| `allowlist` | Who may decrypt one evidence bundle (Seal `seal_approve`) | Move, freeze or approve money |
| `anchor` | Which 32-byte digest was committed to, when, by whom | Reveal anything about the payment |

## Status

- Written 2026-09-28 for the Basecamp mainnet lane. **UNCONFIRMED until Sebastian
  signs off** (the standing rule: no Move change is self-approved).
- `sui move build` clean and `sui move test` **21/21** on Sui CLI 1.77.2, the
  repo's pinned toolchain.
- No third-party dependencies. `grep -rn 'Balance<\|Coin<' sources/` returns
  nothing; `scripts/check-core-no-balance.mjs` should be extended to cover this
  package (it is hard-wired to `splash_core` today).

## Why it exists

`splash_core` publishes immutable and only after an independent review. That is
right for a settlement contract and wrong as a precondition for anchoring a
receipt: today every USDC transfer sits at `anchor_status =
PENDING_MAINNET_PUBLISH`. This package gives the lane a real mainnet anchor and a
real Seal policy now, without touching core's bar.

## The Seal policy (`allowlist`)

One `Allowlist` per evidence bundle (an invoice, a transfer's receipt, a
corridor payout). Its `Cap` is held by the issuer's wallet.

- **Members** are the parties to the payment: issuer, payer, recipient, and the
  corridor partner when there is one (for the Indonesia corridor, DurianPay's
  Splash partner wallet). Sixteen at most.
- **Grants** are time-boxed access for outsiders (an auditor, a tax agent). A
  grant expires on its own and is **revoked, all of them at once, when any
  member is removed**. This is the canon rule "time-boxed auditor grants revoked
  by any authority change", enforced in code rather than remembered.
- **Namespace**: an identity must begin with the list's object id, so a
  ciphertext for one bundle can never be opened by presenting another bundle's
  list.
- `seal_approve(id, allowlist, clock, ctx)` is what the key servers dry-run. It
  aborts with `E_NO_ACCESS` (700) for anyone else.

Identity layout for encryption: `[allowlist object id bytes][nonce]`. Use
`allowlist::namespace` for the prefix.

## The anchor (`anchor`)

`Anchor` objects are **frozen**: nobody, Splash included, can change one.

- `anchor(kind, digest, clock)` — permissionless. Indexers trust anchors by
  `anchored_by`, the same way they trust signatures. For records Splash makes
  about its own decisions (kind 4, verification).
- `anchor_for(kind, digest, bundle, clock)` — the sender must be a **member** of
  the bundle's allowlist (a grant is read-only). For receipts (kind 1), invoices
  (kind 2) and corridor payouts (kind 3). Nobody can pin a false record to
  somebody else's payment.
- The digest is SHA-256, exactly 32 bytes, or the call aborts. Kinds are a
  closed set; add at the end, never renumber.

What goes in the digest is an off-chain matter (`lib/server/evidence.ts` in the
Claude Code prompt): the canonical JSON of the evidence bundle. The chain sees
the hash only.

## Configuration after publish

`config/seal.production.json` gets `packageId`, `policyObjectId` is **per
bundle** (not global), and `approveTarget` becomes
`<packageId>::allowlist::seal_approve`. Note that `lib/server/seal-config.ts`
currently assumes a single policy object; the corridor work changes that to
per-bundle allowlists.

## Ceremony

Publish with the cold multisig as sender; keep the `UpgradeCap` under the same
2-of-3. This package is in scope for the OtterSec review together with
`splash_core`.
