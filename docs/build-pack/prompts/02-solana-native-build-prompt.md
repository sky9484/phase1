# Splash v15 · Solana native build prompt (Colosseum Crypto World's Fair)

**For:** Sebastian and his coding agent · **Date:** 4 Oct 2026 · **Hard deadline:** Colosseum submission **12 Oct 2026**
**Canon:** `docs/build-pack/business-module-v15.md` and the master prompt `01-master-prompt-v15-sui.md` (§0 ground rules apply here too). Load the `solana-payments-engineer` skill, plus `fintech-architect`, `agentic-finance-expert` and `ai-agent-systems-architect`. For UI, load `ui-ux-pro-max`, `isometric-typography-designer`, `frontend-design` and `design-taste-frontend`.

---

You are building the **Solana-native** Splash build. Read this whole prompt first.

## 0. Rules specific to Colosseum

1. **Only work done between 14 Sep and 12 Oct 2026 is judged.** Build in a **new public repo** `splash-solana` so the commit history proves it. The Sui build is disclosed as prior work in the README and the submission.
2. **Scope is one flow, done properly.** A Malaysian business pays a Philippine supplier's invoice in USDC on Solana. Splash ranks the routes, the business approves, a payout partner's deposit address receives it, and the evidence is anchored. Nothing else: no consumer remittance, no Africa, no yield, no "gasless payments" (fees are sponsored through Kora, which is different).
3. **No partner is signed.**
   - Use Noah's **sandbox** if the account is approved. Otherwise use a **clearly labelled mock partner deposit address** ("Mock partner · devnet").
   - Never write a partner name in the UI or the video. Say "payout partner".
4. **Home lane:** `ENGINE_HOME_CHAIN=solana`, `ENGINE_LANES=solana`. Delivery to any network the partner accepts is still allowed, e.g. a CCTP V2 mint to the partner's Polygon address (Sky, 4 Oct: the settlement engine is Sui, Solana and Arbitrum; supported coins and networks are whatever partners and swap providers accept). Arbitrum is not in this build: Colosseum judges Solana, and the Arbitrum build has its own prompt.
5. **Reuse the shared package:** depend on `packages/route-engine` from `sky9484/phase1` (git dependency pinned to a commit). Don't fork the `RouteQuote` type.
6. **Public copy follows master §0 rule 4:** say "payout partner", never "licensed partner".

## 1. Architecture (what talks to what)

| Layer | Solana choice | Notes |
|---|---|---|
| Identity | Google sign-in for the app account (no key from it) | Solana has no zkLogin equivalent (K-S1). Don't imitate zkLogin |
| Daily signer | **Device key**: a WebCrypto **Ed25519, non-extractable** key in IndexedDB. Or a passkey through a secp256r1 smart-wallet program, if Sebastian verifies Swig or LazorKit works with Squads V4 by 6 Oct | The device key is the fast path for the deadline; the passkey is the upgrade. A device key dies with the browser profile (Safari can evict IndexedDB after 7 days unused), so "Add a device" = the recovery kit signs a Squads config change adding the new key |
| Wallet | **Squads V4** multisig vault per org (program `SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf`) as an **autonomous** multisig (`configAuthority` = null, so no outside party can change members) | Single: device key (admin) + kit A, threshold 1. Two-signature: admin + approver (a different KYB associate) + kit A + kit B (two custodians who don't approve), threshold 2 (same rules as master §2) |
| Recovery kit | Same 24 words, screen, descriptor and bring-your-own option as the Sui build (master prompt §2), ed25519 at `m/44'/501'/0'/0'` | Used only for recovery and adding devices. Never for daily signing, never for reading evidence |
| Fees | **Kora** relayer as fee payer; Splash's fee-payer wallet holds SOL only | Allowlist programs: SPL Token, ATA, Memo, Squads, CCTP V2, SAS. Per-org daily cap. ATA rent (~0.002 SOL) is fronted and recovered through plans |
| Asset | Native USDC (SPL, **not** Token-2022): mainnet `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`; devnet `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` | Verify both against Circle's docs before use |
| Invoice reference | **SPL Memo** program (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`) carrying the salted invoice commitment, plus a Solana Pay `reference` key for indexing | Never a plain invoice number or name in a memo: memos are public forever |
| Cross-chain | **CCTP V2** (Solana is V2 with Fast Transfer) for the Polygon lane; Mayan Swift as the alternative | Addresses from developers.circle.com only |
| Swaps | Jupiter for USDT → USDC | Exact-in, slippage cap 10 bps on pegged pairs |
| Evidence | Walrus (Splash's publisher, paid from Splash's Sui wallet) + Seal. Each authorised person has a **reader key**: a non-extractable device key mapped to a Sui address, on the allowlist | Same bundle format as the Sui build |
| Anchor | **Solana Attestation Service (SAS)** attestation holding the batch Merkle root; the same root on Sui (`splash_evidence`) | Verify the SAS program id and SDK on devnet |
| Agent | Zeke, same six agents (master prompt §10) | — |

**Flow (devnet demo):**
1. **Onboard:** sign in, enter the company, generate the recovery kit. A device key and a reader key are created, and an autonomous Squads vault is created with members (device, kit) at threshold 1.
2. **Fund:** devnet USDC to the vault. The Fund screen also shows "from Polygon via CCTP V2" as an option.
3. **Pay invoice:** upload the PDF. The Reader extracts the fields in quarantine; the user confirms them.
4. **Quote:** the engine fans out:
   - (a) Solana direct to the partner's Solana deposit address
   - (b) Solana → Polygon via CCTP V2 to the partner's Polygon address

   Rank by PHP received, then the Router explains the result.
5. **Policy:** tier, limits, KYT (pay-per-check sandbox or a stub labelled as such), the duplicate-invoice check.
6. **Approve:** the device key signs a Squads proposal and approves it (in two-signature mode, the approver approves). Execute: a USDC transfer with memo and reference key to the deposit address. Kora pays the fee.
7. **Deliver:** the Noah sandbox webhook, or the mock partner's webhook, returns "paid" with a bank reference (mock labelled).
8. **Prove:** the evidence bundle goes to Walrus, the Seal allowlist is set to the org Sui addresses, the batch root goes into a SAS attestation (and to Sui), and the receipt page verifies the attestation and the Walrus blob.

## 2. Build list with acceptance criteria

**2.1 Repo and app**
- Next.js (read the version's docs in `node_modules/next/dist/docs/` first), TypeScript strict, `@solana/kit` (web3.js v2), `@sqds/multisig`, the Kora client, `@mysten/walrus` + `@mysten/seal` for evidence.
- Pages:
  - `/` — landing, using the copy system from master §4 with the Solana line: "Settles on Solana. Proof kept on Walrus."
  - `/app/onboarding`, `/app/fund`, `/app/pay`, `/app/receipts/[id]`
  - `/docs` — a short version of master §5: Overview, Self-custody, Fees, Evidence, Risks
- **Acceptance:** [ ] `pnpm build` clean. [ ] Lighthouse a11y ≥ 95. [ ] Works at 390 px.

**2.2 Recovery kit and keys**
- The same screen and copy as master §2.
- Proof of possession: sign a nonce with the kit's ed25519 key and with the device key.
- The device key is `crypto.subtle.generateKey({name:'Ed25519'}, false, ['sign'])`, stored as a CryptoKey in IndexedDB. **Never exportable.**
- **Acceptance:**
  - [ ] A Playwright test confirms no request contains the words.
  - [ ] **Walk-away test, devnet, both modes:** with Splash's server off, use the Squads app (or the Squads CLI) with the kit's key (single) or kits A + B (two-signature) to move the vault's USDC out; record the signatures.
  - [ ] A test that `configAuthority` is null on every vault.

**2.3 Squads vault**
- Create the multisig with members and a threshold.
- The two-signature mode switch is a Squads `configTransaction` (members and threshold change): it removes the admin-held kit A and adds custodian kits A and B made on the custodians' devices. Turning it off needs threshold 2.
- **PLANNED, shown as "next" only:** Squads spending limits as the on-chain form of "scoped authority" for recurring suppliers.
- **Acceptance:** [ ] Tests for single and dual modes. [ ] The admin alone can't execute in dual mode (test).

**2.4 Kora**
- Self-host Kora with a config that allowlists only the programs listed above, caps per org per day, and rejects any instruction that moves value from Splash's fee payer.
- **Acceptance:**
  - [ ] A test that a transaction transferring SOL or USDC **from** the fee payer is refused.
  - [ ] A test that an unknown program is refused.

**2.5 Route engine lane and delivery**
- Implement the `solana` lane in `packages/route-engine`, plus the delivery path to registry networks:
  - `cctp-v2.ts` (Solana → Polygon/Base/Arbitrum delivery with `mintRecipient` = the partner's deposit address; standard and Fast Transfer)
  - `mayan.ts` (Swift)
  - `jupiter.ts` (USDT → USDC)
- The partner registry entry for the mock partner and Noah has `signed: false`.
- **Acceptance:**
  - [ ] Fixtures for a US$10,000 PHP payout showing both lanes and three policies.
  - [ ] The home-lane tie-break test with `ENGINE_HOME_CHAIN=solana`.

**2.6 Payout**
- Noah sandbox adapter (`GET channels/sell?Country=PH`, a per-payment Solana deposit address, signed webhook), or a mock partner service with the same interface, labelled "Mock partner · devnet" in the UI.
- **Invariant test:** the destination is only the partner's per-payment deposit address.

**2.7 Evidence and SAS**
- The same bundle schema as the Sui build (kind 3).
- Store it on Walrus testnet, labelled: testnet data can be wiped.
- The Seal allowlist holds each authorised person's reader address (device key mapped to Sui). Never the kit, never the vault.
- Attest the batch Merkle root through SAS with schema `splash.evidence.root.v1 { root: bytes32, count: u32, period_start: i64, period_end: i64, sui_digest: string }`.
- The receipt page has a "Verify" button: it recomputes the leaf, checks the Merkle path, reads the SAS attestation and the Walrus blob id, and shows pass or fail.
- **Acceptance:** [ ] One end-to-end receipt verifies. [ ] Tampering with any field makes it fail (test).

**2.8 Zeke**
- The six agents from the shared prompt; for the demo, Reader and Router are required.
- **Acceptance:** [ ] `eval:zeke` green with zero unauthorised actions before recording the video.

## 3. Fees on this build (same as every build)

- Splash ↔ Splash: free.
- Outside wallet: tier rate.
- Bank payout: partner and network at cost + 0.10% / 0.15% / 0.15% by policy, minimum US$2, all-in target ≤ 0.33% from US$2,000.
- Kora sponsorship is Splash's cost, recovered through plans. **Never say "free gas on Solana"; say "you don't need SOL".**

## 4. Submission package (due 12 Oct)

- **README:** the problem (World Bank MY→PH 3.92% average, banks up to 9.56%); the flow; the architecture table above; "What is mock" (the partner, KYT if stubbed); "Prior work" (the Sui build); run instructions; devnet addresses; a link to one verifiable receipt.
- **Video, 3 minutes:**
  1. sign in and recovery kit
  2. fund
  3. upload the invoice
  4. Zeke explains the two routes
  5. approve
  6. the partner webhook
  7. the receipt verifies against SAS and Walrus
  8. one sentence: "Splash never holds the money."
- **Go-to-market slide:** Malaysian forwarders paying Philippine agents before the BIR e-invoicing deadline (31 Dec 2026). Recipients join through the payout partner. Three to ten forwarder conversations, LOIs if any.
- **Claims:** no "licensed" about Splash, no partner names, no finality numbers, no "gasless".

## 5. Open checks Sebastian must answer by 6 Oct

1. Swig or LazorKit as a Squads V4 member: works on devnet or not. If not, ship the device key.
2. Kora version and config format.
3. SAS program id and TypeScript SDK on devnet.
4. Noah sandbox approved? If not, the mock partner.
5. CCTP V2 Solana program addresses from Circle's docs.
