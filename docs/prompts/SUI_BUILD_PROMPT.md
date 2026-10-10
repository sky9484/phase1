# Splash Sui main build prompt (v15.1) — repo `sky9484/phase1`

**For:** Sebastian (CTO) and the coding agent he runs · **From:** Sky · **Written:** 11 Oct 2026
**Replaces:** `sebastian-prompt-01-master-v15-sui.md` (4 Oct). Everything in prompt 01 that this prompt does not change still stands; where they disagree, this one wins.
**Canon:** Business Module v15.1 (locked 11 Oct 2026), copied into `docs/build-pack/business-module-v15.1.md`. Design: `docs/build-pack/design-brief_pay-flow_v15.1.md`. Where this prompt and canon disagree, canon wins; ask Sky before guessing.
**Dates:** Part A by **17 Oct** · Part B by **24 Oct** · Part C by **31 Oct** (the CCTP gate) · Part D after that, gated.
**Paste everything below the line into Claude Code at the repo root.**

---

You are working in `sky9484/phase1`: a Next.js 16 app with Sui Move packages under `move/` (`splash_core`, `splash_custody`, `splash_meter`; `splash_evidence` on a branch). Read this whole prompt before writing code. Work in the order of the parts. A task is done only when every acceptance box passes and you have pasted the evidence (command output, test names, digests, screenshots) into the PR.

## 0. Ground rules (non-negotiable)

1. **Read before you write.**
   - `AGENTS.md`, `CLAUDE.md`, `SECURITY.md`, `docs/PHASE-STATUS.md`, `docs/STABLECOIN-LANE.md`, `docs/X402-ASSESSMENT.md`, `docs/build-pack/business-module-v15.1.md` (§4.3, §4.5, §4.6, §4.8, §4.9, §6, §14 are the parts that changed).
   - This Next.js version has breaking changes. Read the guide in `node_modules/next/dist/docs/` before touching routes, layouts, server components or route handlers.
   - For Move: the current Sui docs, the Sui Pilot checkout (`npm run setup:sui-pilot`), and `docs/sui-contract-standards.md`.
2. **Load the skills AGENTS.md makes mandatory** at session start, and say out loud which are missing:
   - UI: `ui-ux-pro-max`, `isometric-typography-designer`, `frontend-design`, `design-taste-frontend`.
   - Move: `sui-move`, `sui-move-project`, `sui-security-auditor` (+ OpenZeppelin math); `/move-code-quality`, `/move-code-review`, `/oz-math`, `/specify` from Sui Pilot.
   - Payments and agents: `agentic-finance-expert`, `payments-treasury-expert`, `fintech-architect`, `ai-agent-systems-architect`.
   - Also `npx skills add mystenlabs/skills --all` if the Mysten skills aren't present.
3. **Branches.**
   - **Never push to `main`.** Only Sebastian merges `main`. Never force-push a shared branch.
   - One branch per task, named `v15.1/<task-id>-<slug>` (e.g. `v15.1/a1-cctp-v2-verify`), cut from current `main` unless the task says otherwise.
   - State at 11 Oct:

     | Branch | Head | What it is | Action |
     |---|---|---|---|
     | `main` | `3f78f5a` | Basecamp build | Base for everything |
     | `feat/v15.1-sui-cctp-v2` | this commit (code at `66c822a`) | CCTP V2 Sui ids + burn/receive PTB builders + planner on V2 + this prompt | Review, then base Part A1–A3 on it |
     | `feat/v15-approval-dead-end` | `1367e07` | Refuses an approval that could only fail | Merge as is (1 commit on main) |
     | `feat/v15-wallet` | `a5ab2e5` | One Sui multisig per org (zkLogin/passkey), salt vault, Enoki-first salt | Rebase, then A5 removes `splash-cold` |
     | `feat/v15-splash-evidence` | `7c8b363` | `splash_evidence` (Seal allowlist + frozen digest anchor) | Rebase, B5 builds on it |
     | `feat/v15-sui-skills` | `8ef7d2c` | Mysten skills | Merge after deleting `.agents/skills/your-skill-name/` |
4. **Claims discipline in every string a user can read** (landing, app, docs, emails, OG images, decks).
   - Never: "licensed" (about Splash or a partner), yield, APY, escrow, netting, discounting, "gasless", "autonomous", "guaranteed", "instant", "no human approval", any finality number (no "~400ms").
   - v15.1 additions (§14.9): never "partnered with AEON", "VAA-integrated", "verified by Google Cloud", "built on Sui Agent Payments", "protected by Sui Threat Intelligence", "FIRA-equivalent", "autonomous payments".
   - Never name a payout partner in reader-facing copy until `lib/partners/registry.ts` has `signed: true` for it. None is signed on 11 Oct.
   - Approved sentences: "Your business holds its own wallet. Splash holds no key to it." · "Zeke drafts. A person approves." · "Screened before every payment." · "a person pre-approves a limited budget" (mandates only) · "can be gas-free" (allowlisted stablecoins on Sui only) · "Free between Splash businesses on Sui".
   - CCTP fees: say "Circle charges no fee on Standard Transfer". Never "free bridge" or "cross-chain is free"; network gas still exists and Splash sponsors the Sui mint.
   - `node scripts/check-copy.mjs` and the copy-rules tests must pass on every PR.
5. **Move changes.**
   - `sui move build` and `sui move test` with the pinned CLI (1.77.2; read `Move.toml` comments on the DeepBook and OpenZeppelin revs before changing deps).
   - Run `/move-code-quality`, `/move-code-review`, `/oz-math` and `sui-security-auditor` on every change; paste their findings and your fixes into the PR.
   - **Nothing in Move merges or publishes without Sebastian's written sign-off.** No `UpgradeCap` changes without the upgrade policy in `docs/UPGRADE-POLICY.md`.
6. **Secrets.** No mnemonic, seed, private key, Enoki private key, Circle key or partner key in the repo, logs, analytics, Sentry breadcrumbs, Walrus or test fixtures. Generate throwaway keys inside tests. Env reads only through `lib/env.ts` (`scripts/check-env-reads.mjs` enforces it).
7. **Money.** bigint minor units (USDC 6 decimals, PHP centavos). `lib/money.ts`. No floats on money, ever, including in quotes and fee maths.
8. **Mainnet.** Real-money mainnet sends in this prompt are **only** the small tests named in A2/C1, from a Splash-owned test org with Splash's own funds, never a client's. Record every digest.

## 1. What v15.1 is on Sui (keep it in your head)

Splash is **self-custodial settlement software**:
- A business signs in with Google (zkLogin, Enoki salt) and gets **its own Sui multisig wallet** plus a **24-word recovery kit** made in the browser. Splash holds no key to it.
- It funds the wallet with USDC on Sui directly, or from Solana/Arbitrum/Ethereum/Base/Polygon via **CCTP V2** (new 8 Oct: Circle domain **8**, Standard Transfer, mint relayed on Sui by Splash with **Enoki-sponsored gas**).
- When it pays, the **route engine** asks the three lanes (Sui, Solana, Arbitrum) for routes and ranks them by **local currency the supplier receives**. Sui is the home lane. From Sui, a payout is a **CCTP V2 burn in the business's own PTB** that mints straight at the payout partner's deposit address on Solana, Arbitrum, Polygon, Base or Ethereum.
- **Zeke** (six narrow agents) drafts. **Policy runs as code inside the same PTB as the burn.** **A person signs** every supplier payout. The chain executes from the business's wallet.
- Every payment leaves an **encrypted evidence bundle** on Walrus, readable through Seal by named people, and anchored on Sui.
- **Splash never holds client money and holds no key that can move it.**

### Invariants (each must have a passing test; add the test if it doesn't exist)
| # | Rule | Where it's enforced | Test |
|---|---|---|---|
| S-1 | No Splash key or role in any org wallet; no `splash-cold`; no Splash-assisted recovery | `lib/wallet/org-wallet-rules.ts` `validateMembers` | `tests/org-wallet-rules.test.mjs` (extend) |
| S-2 | A payout's destination is the business's own address or the partner's one-payment deposit address. For CCTP, `mintRecipient` = that deposit address (Solana: the partner's **USDC token account**, not its wallet). Never a Splash address | `lib/payments/payout-destination.ts` (new) used by every send path | `tests/payout-destination.test.mjs` (new) |
| S-3 | Every supplier payout needs a fresh human signature. No `AUTO_EXECUTE` for anything Zeke or a rule creates. WhatsApp can never approve | `lib/policy/evaluate.ts`, `app/api/webhooks/whatsapp/route.ts` | `tests/policy-no-auto-execute.test.mjs` (new), WhatsApp test |
| S-4 | The policy check and the burn are in **one PTB**; the approval hash covers amount, coin type, destination domain, `mintRecipient`, `destinationCaller`, `maxFee` and `minFinalityThreshold` | `lib/payments/cctp-v2-sui.ts` `appendSuiCctpV2Burn` + `lib/payments/sui-payout-ptb.ts` (new) | `tests/sui-payout-ptb.test.mjs` (new) |
| S-5 | Enoki sponsorship only covers gas for an allowlisted set of Move call targets; it never pays from or to client funds; the relayer's sender address holds no client funds | `lib/server/cctp-relayer.ts` (new) | `tests/cctp-relayer.test.mjs` (new) |
| S-6 | Walrus holds ciphertext only; no KYB file on Walrus; production Seal decrypts only with the requester's own session key (no operator-key decrypt, no mock) | `lib/server/walrus.ts`, `lib/server/seal.ts` | `tests/seal-production.test.mjs` (new) |
| S-7 | The approval card renders only deterministic fields (confirmed invoice + quote), never model text | `components/approval/ApprovalCard.tsx` (new; build it in C5) | unit test |
| S-8 | Only the Company Authority edits policy; loosening edits take effect after 24 h; Zeke can only propose | `lib/policy/org-policy.ts` + `policy_changes` table | `tests/company-authority.test.mjs` (new) |
| S-9 | The engine never sources a payout from USDY or any treasury asset | `packages/route-engine` | engine test |
| S-10 | The 24 words never leave the browser | `components/onboarding/RecoveryKit.tsx` | Playwright request-intercept test |

---

## 2. What already exists on `feat/v15.1-sui-cctp-v2` (code at `66c822a`)

| File | What it does | State |
|---|---|---|
| `lib/payments/cctp-v2-sui.ts` | `SUI_CCTP_V2` mainnet + testnet ids; `CCTP_V2_DESTINATION_DOMAINS` (Ethereum 0, Arbitrum 3, Solana 5, Base 6, Polygon 7); `STANDARD_FINALITY_THRESHOLD = 2000`; `toBytes32Address`; `appendSuiCctpV2Burn(tx, config, params, coin?)` appends the burn to an existing PTB; `buildSuiCctpV2ReceiveTransaction(config, message, attestation)` | Ids come from Mysten `cctp-kit` (ts-sdks-incubation PR #53, citing Circle's Sui packages page "checked 2026-10-05"). **Not yet read on-chain by Splash.** |
| `lib/payments/cctp.ts` | Funding planner on V2 (`SUI_VERSIONS = ['V2']`, route `CCTP_V2`, V1 cut-off warning, `finalityLabel`, claim step mentions the Enoki-sponsored relayer) | Tests pass |
| `components/stablecoin/FundingPlanner.tsx` | Shows "Circle CCTP (V2)" | — |
| `tests/cctp-v2-sui.test.mjs` (7), `tests/funding-and-treasury.test.mjs` | Builders, ids format, domains | 14/14 pass; **full suite not yet run on this branch** |

**Mainnet ids in the code (verify in A1, don't trust):**
- `messageTransmitterV2` `0x16bcfcfc465f96281663a344641c017de84529370e11aa3879d0dce43ad6db87`
- `tokenMessengerMinterV2` `0xeb14978abfe93a37c5d5bf86a0623b923553a5f0e794daac7724f1e2fdbfb830`
- `stablecoinHandler` `0x185ed207c4d64fc594882ab927f9f3c6ff957aad03df8a731ba64378faeeb2bf`
- `messageTransmitterState` `0x0c067f7d325e5b60e3179712e7783534ba1556cbb3d359d8161497e37689230c`
- `tokenMessengerMinterState` `0x06fb166941cd7bc095edc019d054a753ec3f1e4c25f28f2ecc4a6cfa0a9b1167`
- `stablecoinHandlerState` `0xa32de8a6dd0178fb05f662929d55cddb69a25c26bde4b83f89e36d17ead94c41`
- USDC `treasury` `0x57d6725e7a8b49a7b2a612f6bd66ab5f39fc95332ca48be421c3229d514a6de7`; `denyList` `0x403`; `clock` `0x6`
- USDC type `0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC`

**PTB shapes (from `circlefin/sui-cctp` PR #32 and `cctp-kit`):**
- Burn: `deposit_for_burn::deposit_for_burn` → `stablecoin_handler::burn` → `deposit_for_burn::complete_burn`.
- Receive: `receive_message` → `prepare_mint` → `stablecoin_handler::mint` → `complete_mint`.

**Other facts you need:**
- Circle lists Sui as V2 **Standard Transfer** source and destination; **Fast Transfer is N/A** for Sui; **no Forwarding Service into Sui** (so Splash relays the inbound mint). Circle charges no fee on Standard Transfer (`maxFee = 0`).
- V1 deprecation: starts **31 Oct**, completes **1 Dec 2026**. After 1 Dec no route may depend on V1 (that includes Mayan MCTP legs touching Sui).
- Iris (attestation): `GET https://iris-api.circle.com/v2/messages/8?transactionHash=<sui digest>` (sandbox host for testnet). Wait for `status: "complete"` and a non-empty `attestation`.

---

## PART A — By 17 Oct: CCTP V2 on Sui, real (Sky's Part D answers are built in)

Sky's answers to Sebastian's questions (11 Oct), already decided:
1. Sui V2 ids: **pull and add to our code** → done on this branch; A1 verifies them.
2. Inbound mint gas: **Enoki sponsorship** → A3.
3. Policy check + burn in one PTB: **yes** → A2.
4. Payables reserve guard: **check how Treasures does it, or upgrade it** → decided in D3 (policy code now; optional thin Move assert when USDY goes live).
5. Part A by 17 Oct: **yes**.

### A1. Verify every CCTP V2 id on-chain (`v15.1/a1-cctp-v2-verify`)
- Write `scripts/verify-cctp-v2-sui.ts`: for mainnet and testnet, `suiClient.getObject({ id, options: { showType: true, showOwner: true } })` on every state object and `getNormalizedMoveModulesByPackage` on every package. Assert:
  - each package exists and exposes the modules and functions the builders call (`deposit_for_burn`, `burn`, `complete_burn`, `receive_message`, `prepare_mint`, `mint`, `complete_mint`); record each function's parameter list;
  - each state object's type belongs to the expected package (shared object, not owned);
  - `USDC` type matches the coin type of the `treasury` object.
- Cross-check against Circle's own Sui V2 packages page (developers.circle.com, CCTP → Sui packages for V2). If Circle's page and `cctp-kit` disagree, **Circle wins**; update `SUI_CCTP_V2` and note the diff.
- Write the result to `docs/cctp-v2-sui-verified.json` (ids, types, function signatures, date, RPC used). Then remove "not yet verified" from the header of `cctp-v2-sui.ts` and point to that file.
- If the parameter list of any function differs from what `appendSuiCctpV2Burn` / `buildSuiCctpV2ReceiveTransaction` pass, fix the builder and its test. Don't guess argument order: read it from the normalized module.
- **Acceptance:** [ ] script output pasted · [ ] json committed · [ ] builder tests updated to the verified signatures · [ ] full `npm test` green on the branch (it wasn't run on 11 Oct).

### A2. Sui payout PTB: policy check + burn, one transaction (`v15.1/a2-sui-payout-ptb`)
- New `lib/payments/sui-payout-ptb.ts`:
  ```ts
  buildSuiCctpPayout({
    org, wallet,               // the business's multisig (sender)
    quote,                      // RouteQuote from the engine, unexpired
    confirmedInvoice,           // fields a person confirmed
    approvalHash,               // hash the approver signs over
    partnerDeposit,             // { domain, mintRecipient: bytes32, network }
  }): Transaction
  ```
  - Step 1 in the PTB: the existing on-chain policy checks the account needs (`splash_core` `spend_window` / payment-intent checks already used by the stablecoin lane). Read `lib/server/stablecoin-send.ts` and reuse its policy calls; don't invent new Move.
  - Step 2: `splitCoins` the exact amount from the wallet's USDC.
  - Step 3: `appendSuiCctpV2Burn(tx, SUI_CCTP_V2[network], { amount, destinationDomain, mintRecipient, destinationCaller: ZERO32, maxFee: 0n, minFinalityThreshold: 2000 }, coin)`.
  - Step 4: the evidence anchor call (`anchor_for`) if `splash_evidence` is published; else record off-chain and anchor later (B5).
  - No step may transfer any coin to any address other than the burn. Add a PTB inspector `assertOnlyBurnOutflow(tx)` that walks the commands and fails on any `TransferObjects` of a `Coin<USDC>` (test it with a deliberately bad PTB).
- `approvalHash` = sha256 over canonical JSON of `{ orgId, invoiceCommitment, amountMinor, coinType, sourceChain: 'sui', destinationDomain, mintRecipient, destinationCaller, maxFee, minFinalityThreshold, quoteId, quoteExpiresAt }`. The approver's zkLogin/passkey signature is over this hash, and the server rebuilds the PTB from the same fields and refuses if anything differs (S-4).
- `mintRecipient` rules (S-2): EVM networks → 20-byte address left-padded to 32 (`toBytes32Address`); **Solana → the partner's USDC token account (ATA) base58-decoded to 32 bytes**, not the owner wallet. Add `lib/payments/payout-destination.ts` with `assertPayoutDestination({ kind, address, partnerId, paymentId })` that checks the address against the partner's per-payment deposit list and against a deny-list of every Splash-owned address (ops, relayer, fee accounts).
- Gas: this PTB is signed by the business wallet. Sponsor its gas with Enoki too (same allowlist rule as A3), so the business needs no SUI. If Enoki refuses a multisig sender, record the error and fall back to the existing gas path; don't block the payout on it.
- **Acceptance:**
  - [ ] Unit tests: the PTB contains the policy calls before the burn; `assertOnlyBurnOutflow` passes for good and fails for a PTB with an extra transfer; approval-hash mismatch is refused.
  - [ ] Testnet: one burn Sui → Solana devnet and one Sui → Arbitrum Sepolia from a test org multisig, minted at a test token account / address; both digests + Iris message + destination tx recorded in `docs/cctp-v2-runs.json`.
  - [ ] **Mainnet, US$1–5:** Sui → Solana and Sui → Arbitrum, to Splash-owned test addresses (no partner is signed). Digests recorded.

### A3. Inbound mint relayer on Sui, Enoki-sponsored (`v15.1/a3-cctp-relayer`)
- New `lib/server/cctp-relayer.ts` + `app/api/cron/cctp-relay/route.ts` (cron, idempotent):
  1. Input: a `cctp_inbound` row created when the business burns on Solana/Arbitrum/EVM into its own Sui address (from the funding flow), with `source_domain`, `burn_tx_hash`, `expected_amount`, `mint_recipient` (= the business's Sui address).
  2. Poll Iris `GET /v2/messages/{source_domain}?transactionHash=…` until `complete`; store `message` and `attestation`.
  3. Build `buildSuiCctpV2ReceiveTransaction(config, message, attestation)` with the relayer's ops address as sender.
  4. Sponsor with Enoki: `EnokiClient.createSponsoredTransaction({ network, transactionKindBytes, sender, allowedMoveCallTargets })` → sign with the relayer key → `executeSponsoredTransaction({ digest, signature })`. `allowedMoveCallTargets` is built **from the PTB you just made** (read the MoveCall targets from the transaction data), then compared to the fixed allowlist of the four receive functions; any other target → refuse.
  5. Read the mint event; assert the minted amount equals `expected_amount` minus nothing (Standard Transfer, `maxFee` 0) and the recipient equals `mint_recipient`; mark `MINTED`; write evidence.
- The relayer key is an ops key: env only (`CCTP_RELAYER_SUI_KEY` via the secret store), holds **no USDC**, and is listed in the S-2 deny-list. The Enoki **private** API key is server-only (`ENOKI_PRIVATE_KEY`); the public key stays client-side for zkLogin.
- Idempotency: unique on `(source_domain, nonce)`; a second relay of the same message is a no-op (Circle's `used nonce` check aborts; treat that abort as "already minted" only after reading the mint event).
- If Enoki is down: keep the row `ATTESTED`, alert, retry with backoff. The business can always complete the mint itself (show "Finish the transfer" with the same PTB, signed by its own wallet) — that is the self-custody fallback.
- **Acceptance:**
  - [ ] Unit tests: allowlist refusal; nonce idempotency; amount/recipient mismatch → `PARTIAL_EXCEPTION`, never marked minted.
  - [ ] Testnet: Solana devnet → Sui testnet and Arbitrum Sepolia → Sui testnet, relayed and sponsored (digests).
  - [ ] Mainnet US$1–5: Solana → Sui and Arbitrum → Sui into the test org, relayed by Enoki (digests; Enoki usage screenshot).

### A4. Zeke removals (must land before any money demo) (`v15.1/a4-zeke-removals`)
- `lib/policy/evaluate.ts`: delete the `AUTO_EXECUTE` outcome (type line 12 and the returns at ~202 and ~209). Every passing evaluation returns `NEEDS_APPROVAL` with the reason list. Update callers and tests. Add `tests/policy-no-auto-execute.test.mjs` that fuzzes amounts, tiers and rule sets and asserts `AUTO_EXECUTE` never appears (grep in CI too: `grep -rn "AUTO_EXECUTE" lib app` must be empty).
- `app/api/webhooks/whatsapp/route.ts`: remove the `APPROVE` reply path (line ~116). WhatsApp keeps notifications and intent capture ("pay the Manila Freight invoice" → creates a draft, never an approval). Reply text becomes: "Open Splash to review and approve."
- **Acceptance:** [ ] both greps empty · [ ] a WhatsApp "APPROVE" reply leaves the payment `AWAITING_APPROVAL` (test) · [ ] `npm test` green (there is no `eval:zeke` script yet; C2 adds it).

### A5. Self-custody wallet (`v15.1/a5-wallet-self-custody`, rebased from `feat/v15-wallet`)
- Do prompt 01 §2 exactly (roles and modes table, two kits in dual mode, wallet descriptor, recovery kit screen with the exact copy, proof of possession, Enoki salt in production), with these v15.1 notes:
  - `feat/v15-wallet`'s `org-wallet-rules.ts` still has `'splash-cold'` (role type line 32, weight line 60, threshold check ~120–127). Remove the role, the weight and the `splashWeight` check; delete `org-wallet-recovery.ts` and `org-wallet-sweep.ts`'s Splash-assisted paths (72-hour notice, sweep ceremony).
  - The **Company Authority** (C3) is a field on the org, not a wallet role; don't add it to the multisig.
- **Acceptance:** prompt 01 §2 boxes, plus [ ] `grep -rn "splash-cold\|splashWeight" lib app components` empty · [ ] walk-away test digests (testnet, both modes) in `docs/walk-away-sui.json`.

### A6. Merge housekeeping
- Merge `feat/v15-approval-dead-end` (Sebastian). Merge `feat/v15-sui-skills` after deleting `.agents/skills/your-skill-name/`.
- **Acceptance:** [ ] `npm test`, `npm run lint`, `npx tsc --noEmit`, `sui move test` (each package) green on `main` after merges.

---

## PART B — By 24 Oct: engine, funding, partner, evidence, copy

### B1. Route engine as a shared package (`v15.1/b1-route-engine`)
- Create `packages/route-engine/` by **porting `lib/route-engine/` from `sky9484/splash-solana` (branch `build/solana-colosseum`, commit `5ea6677`)**: `index.ts` (`quoteRoutes`, `engineHomeChain`), `quote.ts`, `rank.ts`, `fees.ts`, `policy.ts`, `fixtures.ts`, and its tests (`tests/solana-engine*.test.mjs` → `packages/route-engine/tests/`). Keep the shared contract types from `splash-solana/lib/solana/types.ts` (`RouteQuote`, `PolicyResult`, `ConfirmedInvoice`) in `packages/route-engine/types.ts`.
- Change for Sui: `DEFAULT_HOME_CHAIN = 'sui'`; `ENGINE_HOME_CHAIN=sui`, `ENGINE_LANES=sui,solana,arbitrum`.
- Candidate routes (v15.1 §4.5): same-chain to the partner's deposit address; **CCTP V2 direct from any lane including Sui** (Standard from Sui, Fast where the source supports it); Mayan Swift fallback (`solver_bridge`); Mayan MCTP over V1 legacy only (`cctp_v1`), allowed to 31 Oct, deprioritised to 30 Nov, removed 1 Dec (date-driven, tested with a fake clock); LI.FI/Socket only when a real swap is needed.
- `RouteQuote.flags` adds `'cctp_v2'` and `'relayed_mint'`.
- Safest = same-chain first, then CCTP V2 burn-and-mint, nothing else.
- Home-lane rule: a Sui route within max(US$1, 0.02%) of the best wins **and** the quote shows the difference with "Switch to cheapest". Never applies to "strictly cheapest".
- Fee cap: from US$2,000, cut Splash's fee to a 0.05% floor, waive the US$2 minimum, flag `above_target` if still over 0.33%.
- CCTP Fast fee: read from Iris `GET /v2/burn/USDC/fees/{src}/{dst}`; never hard-code. Sui routes: fee 0, `maxFee` 0.
- Adapters live in `lib/route-adapters/` (lifi, socket, mayan, cctp, noah); the package stays pure (no network) and takes quotes as input. 2.5 s fan-out timeout; a provider timeout drops that provider, not the ranking.
- Replace the ad-hoc planner in `lib/payments/cctp.ts` with the engine where it ranks routes; keep its funding-specific copy.
- **Acceptance:** [ ] ported tests green in phase1 · [ ] new tests: Sui home-lane tie-break; V1 date gates; Fast fee from Iris (mocked); USDY never a source (S-9) · [ ] recorded fixtures for a US$10,000 PHP payout · [ ] the Solana repo can import the same package later without changes (no phase1-only imports).

### B2. Funding into Sui (`v15.1/b2-funding`)
- v15.1 §4.3 table, with the Sui rows now real:
  - USDC on Solana/Arbitrum/Ethereum/Base/Polygon → Sui: CCTP V2 Standard, the business burns from its connected wallet with `mintRecipient` = its own Sui address; A3's relayer mints. Status card: "Waiting for Circle's attestation" → "Arriving in your wallet" → "Arrived".
  - Mayan Swift as fallback when CCTP isn't available for that source.
  - USDsui / SUI → swap to USDC (Cetus, 7K or Aftermath; partner fee 0).
  - MYR: info card for SC-registered exchanges ("Withdraw native USDC to this address"). Splash never touches MYR.
- Controls (tests for each): destination locked to the business's own address; only native USDC/USDT on the allowlist; KYT/threat signals on both addresses (C4); EVM approvals for the exact amount; price impact and quote expiry for volatile assets; Splash fee on funding 0.
- **Acceptance:** [ ] each control has a test · [ ] one testnet funding per source row recorded.

### B3. Partner adapter: Noah sandbox (`v15.1/b3-noah`)
- Prompt 01 §8 stands. Add: per-payment deposit address on **Solana (USDC ATA)** and on Polygon/Base/Arbitrum, so a Sui balance can pay by CCTP V2 burn straight into it. Registry entries `signed: false, sandbox: true`.
- The `PayoutPartner` interface matches `splash-solana/lib/solana-partner/registry.ts` so both builds share it.
- Signed webhooks into evidence; request signing required in production; unique `(payment_id, status)` dedupe.
- **Acceptance:** [ ] sandbox payout created from a testnet Sui burn → Noah sandbox deposit address (or the closest sandbox equivalent; record what Noah's sandbox supports) · [ ] S-2 test covers Noah addresses.

### B4. KYC tiers (`v15.1/b4-kyc-tiers`)
- Prompt 01 §3 stands (signed_in / basic / advanced, limits as app rules, core profile + corridor packs, partner-share ledger, Sumsub `org:<id>` fix, KYB files never on Walrus).

### B5. Evidence (`v15.1/b5-evidence`, rebased from `feat/v15-splash-evidence`)
- Prompt 01 §9 stands. Concrete fixes:
  - `lib/server/walrus.ts`: remove `epochs: 5` (lines ~54, ~84, ~108); Splash's own authenticated publisher, `permanent=true`, 53 epochs, a renewal cron.
  - `lib/server/seal.ts`: production must refuse the mock (line ~72 derives a key from `ADMIN_SESSION_SECRET || 'splash-seal-mock-development-key'`; lines ~189–200 fall back to `mockSealAdapter`). Make `shouldUseMockSeal()` false whenever `NODE_ENV=production` or `NEXT_PUBLIC_NETWORK=mainnet`, and throw at boot if Seal isn't configured. Decrypt only with the requester's session key (S-6).
  - Reader identity: each authorised person's zkLogin address; never the multisig, never a kit.
  - Bundle kinds add: `cctp_burn` (burn digest, Iris message hash, destination mint tx), `cctp_mint` (relayed mint digest, sponsor digest), `policy_change` (C3), `screening_result` (C4).
  - Anchors: `anchor_for` per bundle; same Merkle root format as the Solana build (`splash-solana/lib/solana-evidence/merkle.ts`: domain-separated leaves) so one verifier reads both.
  - `receipt_v2::create_receipt` stops trusting caller-supplied fields (Move change → Sebastian sign-off).
- **Acceptance:** [ ] one mainnet receipt for an A2 test payout verifies end to end (Walrus blob → Seal decrypt by an allowlisted person → anchor digest) · [ ] tampering fails · [ ] `tests/seal-production.test.mjs` proves no mock in production.

### B6. Landing and docs (`v15.1/b6-copy`)
- Prompt 01 §4 (landing) and §5 (docs site) stand, with v15.1 changes:
  - Engine copy: "From Sui, Splash pays through Circle's CCTP V2: your USDC is burned in your own transaction and minted at the payout partner's address." (marketing surface: replace "burned/minted" with "moved by Circle's own transfer protocol" if the jargon rule fires).
  - Docs: rename "Bridges and CCTP V1" to **"Cross-chain: CCTP V2"** (Standard vs Fast, Sui is Standard only, Circle charges no fee on Standard, Splash sponsors the Sui mint gas, V1 retires 31 Oct–1 Dec, Mayan as fallback).
  - Docs: "Company Authority and policy changes" page (C3) and "Screening" page (C4).
  - Pricing row: "Rebalancing between lanes: Circle 0 · Splash 0 · network cost at cost".
  - Remove "Labuan" only if Sky confirms (ask list).
- **Acceptance:** prompt 01 §4/§5 boxes · [ ] `check-copy` green over `content/docs`.

---

## PART C — By 31 Oct: the gate and product completeness

### C1. CCTP gate (v15.1 §6) (`v15.1/c1-cctp-gate`)
- Mainnet, from the Splash test org: Sui → Solana and Sui → Arbitrum at **US$100, US$1,000, US$10,000**, plus inbound Solana → Sui and Arbitrum → Sui relayed mints at US$100 and US$1,000.
- For each: burn digest, Iris time-to-attestation, destination tx, amount received, gas paid by whom, any error. Write `docs/cctp-gate-2026-10-31.md` with a pass/fail line per test and a recommendation.
- **Rule:** keep Sui-sourced payouts only if every test passes. Otherwise payouts fund from Solana/Arbitrum balances and Sui keeps the record; flip `ENGINE_SUI_PAYOUTS=false` and the engine drops Sui as a payout source (test that flag).
- Also answer: do Mayan and LI.FI route Sui on V2 yet? Record the answer with links.

### C2. Zeke: six agents, the loop, the eval gate (`v15.1/c2-zeke`)
- Six agents (Reader, Router, Checker, Planner, Matcher, Auditor) per v15.1 §4.8, each with its own system prompt, tool list and zod schema in `lib/agents/<agent>/`.
- **Reader** is tool-less; invoice PDF/image goes in as content blocks; each field quotes the source verbatim; a new or changed bank detail is never payable until verified out of band.
- **Checker:** duplicate-invoice hash, supplier directory match, KYT/threat signals, tier and limit pre-check → "will pass" / "will fail because …".
- **Planner:** due dates, balances by lane, payables reserve shortfall. Never recommends an asset or states a rate.
- **Router:** explains the engine's ranked quotes; can't change them.
- **Matcher:** chain events + partner webhook until `DST_SETTLED | REFUNDED | FAILED | PARTIAL_EXCEPTION`; never closes a mismatch.
- **Auditor:** evidence pack + MyInvois/BIR export; grants no access.
- Loops: re-quote (expiry or `minOut` move > 5 bps → re-quote and re-confirm), approval reminders (never auto-execute), settlement polling, learning (every human correction → a golden eval case).
- Models: `ANTHROPIC_MODEL=claude-sonnet-5-5` agents; `ZEKE_VERIFIER_MODEL` (default `claude-haiku-4-5-20251001`, retiring no sooner than 15 Oct 2026; pin a replacement before then); `claude-opus-5-5` grades offline evals. Zero data retention configured.
- **Capability roadmap ("Talk to your business", v15.1 §14.6)** — every action ends on the same approval card or a user-pressed Send:

  | Capability | Output | Ends on |
  |---|---|---|
  | Pay a bill | Payment draft with ranked routes | Approval card |
  | "Pay everything due this week" | Batch draft (one PTB on Sui) | One approval card |
  | "Invoice Manila Freight US$4,200 for September" | Receivable draft with a USDC payment link to the business's Sui address + e-invoice reference | User presses Send |
  | "Add Cebu Logistics" | Supplier invite; bank details verified out of band | Directory entry, pending verification |
  | "What do we owe in PHP this month?" | Answer from balances and payables | Text |
  | "Give me September's evidence pack" | Pack + MyInvois/BIR export | Download |
  | Reconcile | Matched / mismatch flags | Exceptions list |
  | Pay for an API (x402) | Price explained; a person signs (today); inside a mandate later (D1) | Approval card |

- Tool rules: Zeke tools are read-only plus `create_draft`. No tool signs, sends, edits policy or grants access (test asserts the tool list). Full account numbers and card numbers never enter model context (beneficiary fingerprint only).
- **Eval gate** (add the script `eval:zeke` to `package.json`; it doesn't exist on 11 Oct): golden + adversarial (poisoned PDF, changed-bank-details email, prompt injection in an invoice memo, "pay now" in WhatsApp, a chat message asking Zeke to raise a limit). **Zero unauthorised actions** required before any demo or release.
- **Acceptance:** [ ] eval report committed · [ ] tool-list test · [ ] each capability row has an e2e test ending on its "Ends on" state.

### C3. Company Authority and policy changes (v15.1 §14.4) (`v15.1/c3-company-authority`)
- `orgs.company_authority_user_id` (default: the onboarding admin; must be a director or officer in the KYB associates list or a board resolution upload).
- New table `policy_changes(id, org_id, proposed_by, proposed_via ['authority'|'zeke_suggestion'], kind, before_json, after_json, direction ['tighten'|'loosen'], step_up_at, effective_at, cancelled_at, evidence_bundle_id)`.
- Rules (in `lib/policy/org-policy.ts`):
  - Only the Company Authority can create an effective change. Zeke can only create `zeke_suggestion` rows, which do nothing until the authority accepts them.
  - **Loosening** (raise a limit, add an allowed supplier, add a mandate, turn off dual mode, reassign the authority itself): passkey/zkLogin step-up (`app/api/step-up/{approve,passkey,pending}` exists; reuse it), `effective_at = now + 24h`, notify every member and approver (email + in-app), cancellable by the authority or any approver during the window.
  - **Tightening:** immediate.
  - Every change → a `policy_change` evidence bundle (who, what, before/after, effective time).
  - `evaluatePolicy` reads only changes with `effective_at <= now`.
- UI per design brief §6: rules written as sentences; the cooling-off message "This takes effect at 14:05 tomorrow. Everyone on the account has been told."
- **Acceptance:** [ ] non-authority edit rejected · [ ] loosening not active before 24 h (fake clock) · [ ] cancel during the window works · [ ] Zeke-originated change can't take effect without the authority · [ ] evidence row written.

### C4. Screening: threat signals (v15.1 §14.7) (`v15.1/c4-threat-signals`)
- New `lib/screening/threat-signals.ts`:
  ```ts
  check({ chain, address?, packageId?, objectId? }) →
    { level: 'none' | 'low' | 'high' | 'unknown', source: string, ref?: string, checkedAt }
  ```
  Providers behind one interface: `kyt-vendor` (the pay-per-check vendor now; Elliptic later, per the 4 Oct decision), `webacy` (evaluate the Sui address-risk API), `trm` (evaluate Sui coverage), `sui-threat-intel` (**stub until the Sui Foundation gives builder access**; Sky is asking).
- Called before any PTB is built, on: the recipient / `mintRecipient`, the funding source address, and every package the PTB calls (CCTP packages, swap routers).
- **Fail closed** on `high`, and on `unknown` above US$1,000; show the reason in the UI. Every result → `screening_result` evidence.
- Copy: "Screened before every payment." Never "protected by Sui Threat Intelligence".
- **Acceptance:** [ ] `high` blocks with the reason shown (test) · [ ] provider timeout → `unknown` → rule above applies · [ ] stub label visible in admin while stubbed.

### C5. UI to the design brief (`v15.1/c5-ui`)
- Build every screen in `docs/build-pack/design-brief_pay-flow_v15.1.md`: the signing card (§3, the one memorable thing; deterministic fields only, S-7), the pay flow (§4), balance header (§5, total = sum of parts or "includes X pending"), policy screen (§6), Zeke roster (§7, task-scoped rows), Zeke chat (§8), x402 spend ledger only when D1 exists (§9).
- Route cards: time and fee lines; CCTP routes show "Circle transfer · arrives at the partner's address"; inbound status chips per B2.
- Quality floor (§10): text ≥ 4.5:1, keyboard reachable, visible focus, 390 px with no horizontal scroll, reduced motion, light and dark. Lighthouse a11y ≥ 95.
- Run every screen through `ui-ux-pro-max`, `frontend-design`, `design-taste-frontend`, `isometric-typography-designer`; paste their notes into the PR.
- **Acceptance:** [ ] Playwright walkthrough at 1440 and 390 px, light and dark · [ ] screenshots in the PR.

---

## PART D — After 31 Oct (gated; don't start before Part C passes)

### D1. `splash_mandate` Move package (v15.1 §14.5; x402/paid-API spend only) (`v15.1/d1-splash-mandate`)
- New package `move/splash_mandate` (own `Move.toml`, Sui framework only; OpenZeppelin math if any arithmetic needs it). **Never used for supplier payouts.**
- Object:
  ```move
  public struct Mandate<phantom T> has key {
      id: UID,
      owner: address,            // the business wallet that funded it
      delegate: address,         // Zeke's delegate address; ctx.sender() must equal it to spend
      counterparty: address,     // the one allowed payee, set only by the owner
      balance: Balance<T>,       // escrowed: grants can't promise more than exists
      per_payment_cap: u64,
      total_cap: u64, spent_total: u64,
      period_ms: u64, period_cap: u64, period_start_ms: u64, spent_in_period: u64,
      expires_at_ms: u64,
      paused: bool,
  }
  ```
- Entry points: `create<T>(coin, delegate, counterparty, caps…, expires_at_ms, clock, ctx)` (owner signs) · `spend<T>(m, amount, memo_commitment, clock, ctx)` (delegate only; checks every cap, period roll-over, expiry, not paused; pays only `counterparty`; emits `MandateSpent`) · `revoke<T>(m, ctx)` (owner only; returns the remaining balance to the owner; destroys the object) · `top_up` (owner) · `pause`/`unpause` with a separate `PauseCap` (Splash may hold it; it can only pause, never withdraw or redirect).
- No bearer capability for spending; no admin withdraw; no counterparty change after creation (a new mandate is a new human signature). Renewal = a new mandate.
- Shape compatible with Sui's agent grant model (testnet, invite-only on 11 Oct) so switching later is cheap; don't depend on it.
- Tests (`sui move test`): each cap; period roll-over at the boundary; expiry; non-delegate spend aborts; spend to anyone but the counterparty impossible by construction; pause blocks spend but not revoke; **revoke and spend in the same checkpoint** resolve safely (shared-object ordering: whichever is sequenced first wins; the other aborts; no double spend); arithmetic overflow at `u64::MAX` caps.
- Run `/specify` first (write the spec into `move/splash_mandate/SPEC.md`), then `/move-code-quality`, `/move-code-review`, `/oz-math`, `sui-security-auditor`. **Sebastian's written sign-off before publish.** Publish testnet first; mainnet only after an external review.
- App: x402 path (`lib/payments/x402-sui.ts`, already built with a person signing) gains "Pay inside mandate" when a live mandate covers the payee and amount; the spend ledger UI (design brief §9).

### D2. Mainnet gate for the Sui payout lane (all must be true)
- C1 passed; S-1…S-10 tests green; `splash_evidence` published with sign-off; Seal production mode on; a signed payout partner (`signed: true`, written agreement); counsel answers on K10 and K13; walk-away test passed on mainnet with US$1 in both modes; Sky's written "go".

### D3. Treasury: USDY on Sui (GATED: K17, K20, eligibility gate, 10 paying customers)
- Existing: `lib/payments/treasury-usdy.ts` treats USDY as a price-accrual token (type `0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdy::USDY`) in **SANDBOX** mode until Ondo eligibility is confirmed in writing. Keep it there.
- **How Treasures does it (checked 11 Oct, Sky asked):** trades are signed by the wallet that holds the funds; no KYC on secondary trading (KYC at issuer redemption); not for US persons; flat 0.1% trading fee; integrator key via hello@treasures.io. **It has no payables-reserve concept.** So the reserve is Splash's to add, and Splash's version is stricter.
- **Decision (Sebastian's Q4):**
  - **Now:** the payables reserve lives in policy code: default = next 30 days of approved payables + 10%, set by the Company Authority (loosening = 24 h rule). The engine and the treasury builder refuse any buy that would take USDC below it.
  - **When USDY goes live:** add a thin on-chain assert in the same PTB: after the swap, a new `assert_min_value(&kept_usdc_coin, reserve_minor)` (name is a proposal) aborts the whole transaction if the kept USDC is below the reserve. It's a few lines, it protects against a compromised server building a bad PTB, and it needs no new shared object. Sebastian decides whether it goes in `splash_core` (burned `UpgradeCap`: think twice) or a tiny new package.
  - Solana/EVM treasury (Treasures, tokenized stocks): policy code only, in a **separate treasury sub-account**, no standing trading permission on the payables wallet (ADR-15.1-03). Not on the Sui roadmap.
- Per-order size cap from live pool depth (price impact < 0.30%); exit = swap USDY → USDC before any payout (S-9); rate live-pulled and labelled "variable, not guaranteed"; Splash fee 0 until counsel; never on Colosseum or Basecamp decks.

---

## 3. Commands
```bash
npm ci --engine-strict=false        # repo pins Node 24; Node 22 works with this flag
npm test                            # full suite (run it on every branch; it wasn't run on 66c822a)
npm run lint && npx tsc --noEmit
node scripts/check-copy.mjs && node scripts/check-env-reads.mjs
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types \
  --import ./scripts/alias-hook.mjs --test tests/cctp-v2-sui.test.mjs   # one file
(cd move/splash_core && sui move build && sui move test)                 # each package
node --experimental-strip-types --import ./scripts/alias-hook.mjs scripts/verify-cctp-v2-sui.ts --network mainnet   # A1 (or npx tsx)
npm run eval:zeke                                                         # C2 (after you add it)
```

## 4. What Sky needs from you, in order
| By | Deliverable |
|---|---|
| 14 Oct | A1 verified ids json; A4 removals merged; A6 merges |
| 17 Oct | A2 + A3: testnet runs and mainnet US$1–5 both directions, digests in `docs/cctp-v2-runs.json`; A5 walk-away digests |
| 24 Oct | B1 engine package (Sui home lane, V2 everywhere); B2 funding; B3 Noah sandbox; B5 evidence with one verified mainnet receipt; B6 copy and docs |
| 31 Oct | C1 gate report; C2 eval green; C3 Company Authority; C4 screening; C5 UI screenshots |
| 1 Dec | No route depends on CCTP V1 |

## 5. Ask Sky, don't guess
- Which payout partner is signed (until yes: sandbox only, never named)?
- Enoki: which Enoki project/app and who holds the private key; monthly sponsorship budget cap.
- Sui Threat Intelligence: did the Sui Foundation answer about builder access?
- The Splash test org and the Splash-owned Solana/Arbitrum test addresses for the mainnet US$1–10,000 tests, and who funds them.
- Replace `REQUIRED_HONESTY_SENTENCE` in `content/money-path.ts` and drop the Labuan line (recommended: yes, "Splash is not yet a licensed money-services business.").
- Is SPLASH MY SDN BHD incorporated (`content/brand.ts` `legalEntity`)?
- Ondo's "permissionless" statement in writing (K20) before D3 leaves SANDBOX.
