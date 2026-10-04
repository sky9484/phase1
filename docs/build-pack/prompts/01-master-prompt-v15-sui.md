# Splash v15 · Master build prompt (Sui main build, repo `sky9484/phase1`)

**For:** Sebastian (CTO) and the coding agent he runs · **From:** Sky · **Date:** 4 Oct 2026
**Canon:** `docs/build-pack/business-module-v15.md` (complete draft; UNCONFIRMED until Sky says "update v14 → v15"). Where this prompt and that document disagree, the document wins. Ask before guessing.
**Paste everything below the line into Claude Code at the repo root.**

---

You are working in `sky9484/phase1`, a Next.js app with Sui Move packages under `move/`. Read this whole prompt before writing code. Work in the order of the sections. Each section ends with acceptance criteria: a section is done only when every criterion passes and you have pasted the evidence (command output, test names, screenshots) into the PR description.

## 0. Ground rules (non-negotiable)

1. **Read before you write.**
   - `AGENTS.md` and `CLAUDE.md`. This Next.js version has breaking changes, so read the relevant guide in `node_modules/next/dist/docs/` before touching routes, layouts or server components.
   - `docs/build-pack/business-module-v15.md`, `SECURITY.md` and `STATUS.md`.
2. **Load the skills AGENTS.md makes mandatory** at the start of the session, and say so if any is missing:
   - **UI work:** `ui-ux-pro-max`, `isometric-typography-designer`, `frontend-design`, `design-taste-frontend`.
   - **Move work:** `sui-move`, `sui-move-project`, `sui-security-auditor` (+ OpenZeppelin math).
   - **Payments and agent logic:** `agentic-finance-expert`, `payments-treasury-expert`, `fintech-architect`, `ai-agent-systems-architect`.
   - Also run `npx skills add mystenlabs/skills --all`.
3. **Branches.**
   - Never push to `main`; Sebastian merges.
   - One branch per section below, named `v15/<section>`.
   - Rebase `feat/v15-wallet`, `feat/v15-splash-evidence` and `feat/v15-approval-dead-end` onto the current `main` first. Merge `feat/v15-approval-dead-end` as is. Merge `feat/v15-sui-skills` only after deleting `.agents/skills/your-skill-name/`.
4. **Claims discipline in every string a user can read.**
   - Never: "licensed" (about Splash), yield, APY, escrow, netting, discounting, "gasless payments", "instant off-ramp", "autonomous", "guaranteed".
   - Never name a payout partner (Noah, PDAX, GCash, DurianPay, Airwallex, Stripe) in reader-facing copy until Sky confirms the agreement is signed. In code and config, partner names are fine.
   - Approved self-custody sentence, word for word: **"Your business holds its own wallet. Splash holds no key to it."**
   - Public copy says **"payout partner"** or **"payout partner of record"**, never "licensed partner". `scripts/copy-rules.mjs` already bans that, and Noah's Malaysian payout entity isn't disclosed.
   - On marketing surfaces (landing, mobile landing, trust, OG image, `content/`), the existing jargon rule bans Walrus, Seal, on-chain, attestation, PTB and payment intent. Say "encrypted record", "recorded", "final". The docs site gets its own surface (§5) where those words are allowed.
   - Never say stablecoin transfers "are free" or "cost nothing". The approved wording is "can be gas-free" (allowlisted stablecoins only; USDT is not on the list), and "free between Splash businesses on Sui" for Splash's own price.
5. **Move changes:**
   - Run `sui move build` and `sui move test` with the pinned CLI (1.77.2).
   - Apply `/move-code-quality`, `/move-code-review` and `/oz-math` from the Sui Pilot checkout (`npm run setup:sui-pilot`).
   - Nothing in Move merges without Sebastian's written sign-off.
6. **No secret, mnemonic or private key ever reaches the server, the logs, analytics or Walrus.**

## 1. What v15 is (one paragraph you must keep in your head)

Splash is **self-custodial settlement software**:
- A business signs in with Google (zkLogin) and gets its own wallet, backed by a **recovery kit**: 24 words generated in the browser.
- It funds the wallet with any coin a swap or bridge provider accepts. The coin becomes USDC or USDT in its own wallet, held on the three **settlement lanes**: Sui, Solana and Arbitrum.
- When it pays, Splash's **route engine** asks the three lanes for routes and ranks them by the local currency the supplier receives (Cheapest / Fastest / Safest). **Sui is the home lane.** Delivery goes to whatever token and network the payout partner accepts (Polygon and Base are delivery networks, not lanes).
- **Supported cryptocurrencies and networks = one registry** of what partners and swap providers accept (`lib/partners/registry.ts` plus the providers' live lists).
- A **payout partner of record** pays the supplier's bank. The business is that partner's own customer.
- **Zeke** (six narrow agents) proposes; a person approves; the chain executes.
- Every payment leaves an encrypted evidence bundle on Walrus, readable through Seal and anchored on-chain.
- **Splash never holds client money and holds no key that can move it.**

## 2. Self-custody wallet (`v15/wallet-self-custody`, rebased from `feat/v15-wallet`)

**Remove**
- The `splash-cold` role, its weight, and the check `splashWeight >= ORG_WALLET_THRESHOLD` (`lib/wallet/org-wallet-rules.ts`).
- The Splash-assisted recovery flow in `lib/wallet/org-wallet-recovery.ts` and `org-wallet-sweep.ts`: request, 72-hour notice, sweep ceremony.
- Any env or config for a Splash cold public key.
- Any Move recovery path that accepts a Splash or insider party for client accounts. Flag it to Sebastian; don't edit Move silently.

**Add: roles and modes**

| Mode | Threshold | Members (weight 1 each) |
|---|---|---|
| `single` (default) | 1 | `admin` zkLogin · `recovery-kit` A (held by the admin) · optional `admin-passkey` |
| `dual` (company setting) | 2 | `admin` · `approver` (a **different director or officer** from the KYB associates list, own Google account and device) · `recovery-kit` A (custodian 1) · `recovery-kit` B (custodian 2). Custodians must not be the admin or the approver |

- **Why two kits in `dual`:** with one kit held by the admin, admin + kit = 2 would skip the approver. So switching `dual` on **retires the old kit** (the migration creates a new address) and generates kits A and B on the two custodians' own devices.
- **Why the walk-away needs both kits:** zkLogin members stop working if Splash's Google OAuth client, the salt or a prover is gone, so in `dual` the no-Splash path is A + B.

- `validateMembers` refuses:
  - any member without an org user, except `recovery-kit`
  - a `dual` wallet whose admin and approver are the same user, the same Google subject, or not distinct KYB associates
  - a `dual` wallet without exactly two kits
  - a `single` wallet with more than one kit
  - a kit public key reused from a retired wallet
  - any role named `splash*`
- Switching mode is `migrateOrgWallet`: a new address, then a sweep the **current** wallet signs. Turning `dual` off needs threshold 2: normally admin + approver; the two custodians together could also do it, so Settings says custodians are a trusted role.
- Settings line, exact: "Any two keys can sign. Keep both recovery kits with people who don't approve payments, in separate places."
- **Wallet descriptor:** a downloadable, non-secret JSON file listing every member's public key (including the zkLogin public identifier), weights, threshold and addresses per lane. It is needed to spend from the multisig without Splash. Offer it at the kit screen and in Settings → Wallet.
- **Bring your own kit:** an option to paste only public keys plus proof-of-possession signatures from a kit made in any BIP-39 tool. Publish the kit generator's source and build hash.

**Add: the recovery kit (copy Noah's pattern from Sky's screenshot)**
- Component `components/onboarding/RecoveryKit.tsx`, shown right after the company step, before the wallet exists.
- **Generate in the browser only:** `@scure/bip39` `generateMnemonic(wordlist, 256)` (24 words). Derive:
  - Sui ed25519 at `m/44'/784'/0'/0'/0'` (`Ed25519Keypair.deriveKeypair`)
  - Solana ed25519 at `m/44'/501'/0'/0'` (SLIP-0010)
  - EVM secp256k1 at `m/44'/60'/0'/0/0` (viem `mnemonicToAccount`)
- **Screen copy (exact):**
  - Title: **"Your recovery kit"**
  - Body: "If you ever lose access to your Google account, these 24 words let you get your money back — even without Splash."
  - The words are blurred until "Show words". Buttons: "Show words", "Copy", Download icon.
  - Notice box: "These words are made on your device. Splash never sees them and can't recover them for you. Write them down and keep them somewhere safe, away from the people who approve payments."
  - Primary: "I've saved them" → a 3-random-word check → "Continue".
  - Footer: "Not {email}? Log out and start over."
- **Proof of possession:** the client signs a server nonce with each derived key. The server stores **public keys and signatures only** and verifies each signature before creating the wallet.
- Zero the mnemonic and seed buffers after derivation. Disable autofill and spellcheck on the confirm inputs. Never put the words in React state that persists (no URL, no localStorage, no Sentry breadcrumbs).
- **Settings → Wallet:**
  - Address per lane; mode (single or two-signature) with the Settings line above; descriptor download.
  - "Check my recovery kit": re-enter the words; the client compares derived public keys; nothing is sent.

**Keep:** the salt vault (`lib/server/salt-vault.ts`), Enoki-first salt resolution (`lib/auth/zklogin-salt.ts`), versioned `org_wallets` rows, and the partial unique index.

**Enoki (Sky: "Sebastian will do the Enoki… settle before 6")**
- Enoki is the salt authority and primary prover; Shinami is the fallback prover with the same salt.
- Server salt is allowed for **existing test users only**. New org wallets refuse to create on server salt in production (`ZKLOGIN_SALT_MODE=enoki` required).

**Acceptance**
- [ ] `grep -rn "splash-cold\|splashWeight" lib app components` returns nothing.
- [ ] Unit tests cover validateMembers for both modes and every refusal case.
- [ ] A Playwright test runs the recovery-kit screen and asserts that no request body contains any of the 24 words (intercept all requests).
- [ ] **Walk-away test, Sui testnet, both modes.** Importing the kit into Slush controls only the kit's own address, not the multisig, so the test is:
  - [ ] Create the wallet and fund it with 1 USDC.
  - [ ] Stop the Splash server.
  - [ ] Using only the kit(s), the descriptor and public tools, move the 1 USDC out: `sui keytool multi-sig-combine-partial-sig`, or Splash's open-source static recovery page shipped in the repo's releases. Single mode uses kit A; dual mode uses kits A + B.
  - [ ] Record both digests.
- [ ] Tests that the admin alone, the approver alone, or one kit alone cannot sign in `dual`.
- [ ] **First-hour check carried from v15:** a gasless `send_funds` USDC transfer whose sender is the multisig, signed by its zkLogin member, dry-run on mainnet. Record the result either way.

## 3. KYC tiers (`v15/kyc-tiers`)

| State | Unlocks in the app | Verified by |
|---|---|---|
| `signed_in` | Receive on invoices; sandbox | — |
| `basic` | Stablecoin → stablecoin: to Splash businesses and to outside wallets (ownership proof + KYT). Limits US$5,000/day, US$25,000 per 30 days | Splash admin review |
| `advanced` | Stablecoin → local bank/e-wallet through a partner. Limits US$100,000/day, US$1M per 30 days, plus partner limits | The partner's KYB (Noah Business Customer Prefill + hosted session), pre-filled by Splash |

- Limits are **app rules** (what Splash builds and relays), not locks on money. Show this sentence in Settings → Verification: "These limits apply to payments you make through Splash. Your wallet is yours."
- **Core profile** collected once. **Corridor packs** hold only the per-country deltas.
- **Partner-share ledger** table: `org_id, partner, fields[], consent_version, shared_at, shared_by`. Consent screen per partner and per corridor.
- **Fix first** (known bugs): Sumsub webhook `externalUserId` must be `org:<id>`; an unknown org must fail closed in production.
- KYB files go to Postgres or object storage. **Never Walrus.**
- **Acceptance:**
  - [ ] A tier gate test per action (send to Splash business, send to outside wallet, bank payout) for each state.
  - [ ] A consent-ledger row is written for every partner submission (test).

## 4. Landing page: correct the wording and the order (`v15/landing-copy`)

The live landing is `components/IsometricLanding.tsx` with the hero in `components/landing/SettlementCinematic.tsx`. Locked strings are in `content/claims.ts`, the FAQ in `components/landing/Landing.tsx`, and copy guards in `scripts/check-copy.mjs`, `scripts/copy-rules.mjs` and `tests/landing-and-numbers*`.

**4.1 What is wrong today (fix every row)**

| Where | Current | Problem | Replace with |
|---|---|---|---|
| `SettlementCinematic.tsx` hero description | "Splash nets, yields, discounts, and escrows" | Claims yield, netting and escrow as live | See 4.3 Hero |
| `SettlementCinematic.tsx` vision | "Payments are the feature. Treasury is the product." / "Stripe and Airwallex move money… netting it, yielding it, discounting it, escrowing it" / pillars Netting, Yield… | Treasury and yield thesis is dead in v15; names unsigned partners | See 4.3 Vision |
| `SettlementCinematic.tsx` telemetry | "Edge fee · Modeled 0.70%", "Treasury · USDY posture · Variable APY" | Wrong price; yield | See 4.3 Telemetry |
| `content/claims.ts` `lockedCopy` | `fee: '0.70% to local currency'`, `speed: '~400ms Sui settlement finality'`, `yield: 'Variable APY - T-bill-backed'`, `headline: '…Keep cash working.'` | v15 price; unsourced speed; yield | See 4.4 |
| `IsometricLanding.tsx` marquee | "~400ms", "0.70%", "1 live testnet", "Modeled routes" | Same | See 4.3 Marquee |
| `IsometricLanding.tsx` `#loops` (Settle / Save "Live" / Supply) | Save is marked **Live** | Yield shown as live | **Delete the section** from the landing. Save and Supply stay on `/working-capital`, labelled Roadmap |
| `partnerRail` (Stripe, Airwallex, Pyth, DeepBook, Sumsub, Sui) | Logos of unsigned partners | Canon: no unsigned partner named | **Delete the rail.** (A "Built on" rail naming Walrus or Seal would fail the jargon rule.) |
| `operatingLayers` (Liquidity, Treasury "make cash work harder") | Custody/yield framing | Not v15 | **Delete** |
| `recipientLadder` (Sweep account, Stored balance) | Custody products | Self-custody now | **Delete** |
| `comparisonRows` | Unsourced bank/broker/Wise figures; rows for yield, netting, early payment, "AI treasury copilot", "Payout, sweep, stored balance" | Unsourced; banned claims | See 4.3 Compare |
| `trustGates[0]` "A payout only exists between verified businesses" | False for outside wallets in v15 | Fix | See 4.3 Trust |
| `trustGates[2]` "Atomic or not at all" | True on one chain, **false across chains** (a bridge leg can be in transit) | Overclaim | See 4.3 Trust |
| Route chips `MYR IDR VND THB SGD EUR GBP` | Implies corridors | Only MYR, PHP, IDR in plan | MYR · PHP · IDR with a status chip each |
| Header status "Sandbox · MY-PH testnet" (hard-coded) | Stale | Must read env | `NEXT_PUBLIC_NETWORK_STATUS` → "Testnet" / "Mainnet · USDC lane" |
| `app/page.tsx` JSON-LD description "US dollars to Philippine pesos…" | Narrow | — | "Self-custodial stablecoin payments for Southeast Asian businesses, delivered to local banks by payout partners. A person approves every payment." |
| FAQ in `Landing.tsx` | Flat fee + bps on USD→PHP; "final in under a second" | v15 price; unsourced | See 4.5 |
| `components/mobile/MobileLanding.tsx` | "~400ms settlement", "0.70% to local currency", unsourced bank "3–5%" | Same errors on the phone landing | Apply every change in this section to the mobile landing too, same strings and order |
| `content/money-path.ts` `REQUIRED_HONESTY_SENTENCE` | "Labuan FSA license in process. Splash is not yet a licensed money-services business." | v15 parks the Labuan path | Locked copy: **don't change without Sky.** Proposed: "Splash is not yet a licensed money-services business." Ask Sky first |

**4.2 New section order (top to bottom)**
1. Header. Nav: How it works · Engine · Zeke · Pricing · Trust · Docs. Status chip from env. CTA "Open your wallet".
2. Hero (cinematic kept, copy replaced).
3. Marquee (new items).
4. **The problem** (new, short): three sourced numbers and "five systems".
5. **How it works**: five steps.
6. **The engine**: lanes, policies, corridors.
7. **Zeke**: six agents and the authority boundary (keep the control-plane reveal).
8. **Trust**: self-custody, two KYC tiers, approval, proof.
9. **Pricing**: table plus the updated `FeeCalculator`.
10. **Compare**: two columns, sourced only.
11. FAQ.
12. Final CTA.
13. Footer.

Delete from the landing: `#loops`, `#platform` (operating layers), the recipient ladder, the yield benchmark strip, and the partner logo rail.

**4.3 Exact copy**

*Hero* (`SettlementCinematic.tsx`)
- Kicker: "Splash · Stablecoin settlement, home on Sui"
- Display: "Pay suppliers across Asia." / span: "Keep the proof."
- h1: "Pay suppliers in the Philippines and Indonesia in stablecoins, delivered to their bank, with a record your auditor can check"
- Description: "Your business holds its own wallet. Splash finds the cheapest, fastest or safest route across Sui, Solana and Arbitrum. A payout partner pays the supplier's bank, and every payment keeps an encrypted record. A person approves every payment."
- Buttons: "Open your wallet" (primary) · "See the engine" (ghost) · Waitlist stays.
- Proof line: "Self-custody wallet" · "Free between Splash businesses on Sui" · "Zeke prepares. You approve."

*Telemetry callouts* (4 cards)
1. tag "Wallet · Self-custody" · value "Your keys" · meta "Made on your device. Splash holds none."
2. tag "Engine · 3 lanes" · value "Best route" · meta "Ranked by what your supplier receives."
3. tag "Payouts · Target" · value "≤ 0.33%" · meta "All-in, on payouts from US$2,000."
4. tag "Agent · Human-final" · value "Zeke desk" · meta "Zeke prepares. You approve."

*Vision*
- Chip "The product". Title: "Moving money got cheap." / span: "Proving it is the product."
- Lede: "Stablecoin transfers on Sui can be gas-free. What finance teams still lack is one record that links the invoice, the approval, the route and the bank credit. Splash keeps that record for every payment."
- Pillars: Invoice · Approval · Route · Receipt.

*Marquee*: ["Self-custody", "Splash holds no key"], ["Free", "between Splash businesses on Sui"], ["3 lanes", "Sui · Solana · Arbitrum"], ["≤ 0.33%", "all-in target from US$2k"], ["Human-approved", "every payment"], ["Encrypted", "a record for every payment"]

*The problem* (new `#problem`; numbers live in `content/sea-numbers.ts` with sources)
- Kicker "The problem". Title: "Paying the Philippines from Malaysia" / span: "costs up to 9.56%."
- Three stats: "9.56% bank price" · "3.92% corridor average" · "1.49% hidden in the FX rate". Source line: "World Bank Remittance Prices Worldwide, Malaysia→Philippines, Q3 2025 (US$200 and US$500 sends)."
- Line: "And the proof is scattered: the invoice in email, the approval in chat, the payment in a bank portal, the rate in a screenshot."

*How it works* (`flowSteps`; keep the five v4 images in this order)
1. "Fund your wallet": "Bring USDC, USDT or another coin our swap providers accept, from any wallet. It arrives as USDC or USDT in your own wallet." · stat "Any wallet in" · image `flow-collect-v4.png`
2. "Pick a route": "Splash asks Sui, Solana and Arbitrum for routes and shows what your supplier will receive. Choose Cheapest, Fastest or Safest." · stat "Ranked by local received" · `flow-review-quotes-v4.png`
3. "Approve": "You approve with your sign-in or passkey. In two-signature mode, a second person approves too." · stat "Human approval" · `flow-settle-v4.png`
4. "Delivered locally": "A payout partner pays your supplier's bank or e-wallet in MYR, PHP or IDR. Paying another Splash business is free on Sui." · stat "MYR · PHP · IDR" · `flow-deliver-v4.png`
5. "Proof kept": "The invoice, approval, route, rate and bank reference are kept in one encrypted record your auditor can open." · stat "Encrypted record" · `flow-proof-v4.png`
- Replace the two branch notes with one: "Paying another Splash business? It goes straight across on Sui, free."

*The engine* (`#engine`, replaces `#corridors`)
- Title: "Three chains quote." / span: "Your supplier gets the most."
- Body: "Every payment asks Sui, Solana and Arbitrum for a route to the payout partner, on whatever network the partner accepts, then ranks the quotes by how much local currency arrives. Sui is home: when a Sui route is within US$1 or 0.02% of the best, we pick it and show you the difference."
- Link: "Supported coins and networks" → `/docs/payments/supported-networks`.
- Three policy cards:
  - "Cheapest: most local currency received."
  - "Fastest: shortest time, within 0.10% of the cheapest."
  - "Safest: native USDC burn-and-mint or same-chain only."
- Corridor chips with status: MYR · PHP · IDR (each "Partner onboarding" until Sky flips a flag).
- Keep the corridor bridge image.

*Zeke* (`copilotLayers` → six agents)
- Reader: "Reads invoices in a sealed sandbox. Every field is shown to you before it's used."
- Router: "Explains the engine's quotes in plain words."
- Checker: "Tells you before you approve whether a payment will pass your limits."
- Planner: "Spots upcoming payables and how to fund them."
- Matcher: "Matches partner confirmations to invoices and flags gaps."
- Auditor: "Builds the evidence pack for your accountant."
- Section title: "Zeke prepares." / span: "It can never pay."
- Body: "Zeke has no key. Its only output is a draft. Your limits run as code, a person approves, and the network executes."
- Keep the MemWal line: "MemWal remembers patterns, never personal data or amounts."

*Trust* (four cards, then the foot)
1. "Your keys": "Your business holds its own wallet. Splash holds no key to it. A recovery kit made on your device gets you back in, even without Splash." · meta "Self-custody"
2. "Two levels of checks": "Basic lets you pay in stablecoins after a quick review. Advanced adds bank payouts, verified by the payout partner itself." · meta "KYC tiers"
3. "A person signs": "Zeke prepares. You approve. Nothing moves without a signature from your wallet." · meta "Human-final"
4. "Proof that lasts": "Each step is confirmed before the next starts, and the record shows where your money is at every point." · meta "Encrypted and recorded"
- Foot: "Not yet a licensed money-services business · Bank payouts by a payout partner of record in each country · {network status}"

*Pricing* (`#pricing`; update `components/landing/FeeCalculator.tsx` to the v15 formula: route at cost + partner at cost + Splash 0.10%/0.15%/0.15% by policy, min US$2, target line at 0.33%)

| You pay | Price |
|---|---|
| Another Splash business, on Sui | Free |
| An outside wallet | 0.25% Basic · 0.10% Advanced · 0.07% Pro, min US$2 |
| A bank or e-wallet | Partner and network cost at cost + 0.10–0.15% Splash fee. Target all-in ≤ 0.33% from US$2,000 |
| Moving to your own wallet on another chain | Network cost + US$1 |
| Plans | Free · Business US$149/month (founding US$99) · Pro US$499/month |

- Footnote: "Quotes show every cost before you approve. If a payout would cost more than 0.33% all-in, we lower our fee first and tell you before you send."

*Compare* (sourced only; two columns)
- Rows: All-in cost (Bank: "up to 9.56%, avg 3.92%, World Bank Q3 2025" | Splash: "target ≤ 0.33% from US$2k") · Who holds your money (Bank: "the bank" | Splash: "you") · Approvals (Bank: "portal roles" | Splash: "one or two signatures, enforced by the network") · Proof (Bank: "statement line" | Splash: "invoice, approval, route and bank reference in one record").

*Final CTA*: Title "Open your wallet." / span "Keep your keys." Body: "Start with Google. Bank payouts open as each country's payout partner goes live." Buttons: "Open your wallet" · "Read the docs" (→ `/docs`).

*Footer*
- Tagline: "Self-custodial stablecoin settlement for Southeast Asian businesses."
- Status chips: `{network status}` · "Zeke prepares. You approve."
- Bar: "Free between Splash businesses on Sui · Payout target ≤ 0.33% from US$2k".
- Add a Docs column linking `/docs` sections.

**4.4 `content/claims.ts`**
- `lockedCopy.headline` = "Pay suppliers across Asia. Keep the proof."
- `fee` = "≤ 0.33% all-in target on payouts from US$2,000"
- `feeFootnote` = "Free between Splash businesses on Sui. Every cost shown before you approve."
- `speed` = "Delivery time shown before you approve"
- Delete `yield`.
- `agent` unchanged.
- Rewrite `claims.custody` to "Self-custody: the business holds every key; Splash holds none.", with evidence = the wallet rules file + walk-away test, status `testnet-verified` once the test passes.
- Delete `treasuryYield` and `receivable` from landing use.
- `footerLegal` = "Splash is software and is not yet a licensed money-services business. Your business holds its own wallet; Splash holds no key to it. Bank payouts are made by payout partners of record under their own terms." + the env status sentence. (This drops the Labuan line; confirm with Sky together with `money-path.ts`.)

**4.5 FAQ** (`LANDING_FAQ`)
1. "Does Splash hold a money-services licence?" — "No. Splash is software and is not yet a licensed money-services business. Your wallet is yours, and bank payouts are made by payout partners of record under their own terms."
2. "What does a payment cost?" — "Paying another Splash business on Sui is free. Bank payouts cost the partner's and network's price at cost plus a 0.10–0.15% Splash fee, with a target of 0.33% all-in from US$2,000. You see every cost before you approve."
3. "How long does it take?" — "The quote shows the expected time before you approve. It depends on the route and the local bank rail."
4. "Does Zeke move money?" — "No. Zeke prepares drafts. A person approves every payment."
5. "What if I lose access?" — "Sign in with Google again. If you lose your Google account, your 24-word recovery kit and your wallet file get your money back with our open recovery tool, even without Splash. If you lose everything, Splash can't recover it, so keep the kit safe."
6. "Which coins and networks?" — "You can fund with any coin our swap providers accept. Balances are USDC, or USDT where the payout partner accepts it, on Sui, Solana and Arbitrum. Payouts go out on whatever network the partner accepts. The full list is in the docs."

**4.6 Guards** (`scripts/copy-rules.mjs` and `scripts/check-copy.mjs`)
- **Keep** every existing rule. The approved sentences in this prompt were written to pass them. "Splash holds no key to it" does not match the `/non-custodial/` or `/we don't hold user money/` bans.
- **Add** a `V15_MARKETING_RULES` array in `copy-rules.mjs`, applied only to the **marketing** surface (which already includes `components/mobile/`): `/0\.70%/`, `/~?400 ?ms/`, `/nets, yields|\bnetting\b|\bescrow/i`, `/max(?:imum)? fee/i`, `/\b4 lanes\b|four chains/i`. Exempt `app/working-capital/**`, which stays labelled Roadmap. **Don't** add these to the `banned` list in `check-copy.mjs`: it also scans `lib/`, where `yield-accrual.ts` and the cron jobs legitimately use those words.
- **Add** a partner-name rule for the marketing and customer surfaces: `/\b(Noah|PDAX|GCash|GCrypto|DurianPay|Airwallex|Stripe)\b/i` fails unless `lib/partners/registry.ts` marks that partner `signed: true`. The registry lives in `lib/` (exempt) so naming it there is fine.
- **Add** a `docs` surface: `app/docs/**` and `content/docs/**` get `CUSTOMER_RULES` only, without the jargon rule, so the docs can say Walrus, Seal and attestation. `surfaceFor` must test docs before the `content/.*` marketing pattern.
- Update `tests/landing-and-numbers*` and the copy-rules tests to the new strings and rules.

**Acceptance**
- [ ] `npm run lint && npm test && node scripts/check-copy.mjs` all pass.
- [ ] Screenshots at 1440 and 390 px, light and dark, attached.
- [ ] No horizontal scroll at 390 px.
- [ ] Lighthouse accessibility ≥ 95.
- [ ] `grep -rniE "yield|apy|escrow|0\.70%|400 ?ms" components/IsometricLanding.tsx components/landing components/mobile content/claims.ts` returns nothing.

## 5. Docs and compliance site (`v15/docs-site`), modelled on docs.noah.com

- **Route:** `app/docs/[[...slug]]/page.tsx`, with a left nav, page content from `content/docs/**/*.md`, and on-page headings on the right. Static generation. Search optional.
- **Information architecture (create every page with real content from the Business Module):**

| Section | Pages |
|---|---|
| Getting started | Overview · How Splash works (the 5-station diagram) · Compliance overview · Security overview |
| Accounts | Your wallet and self-custody · The recovery kit · Two-signature mode · Lost access |
| Verification | KYC tiers · What we collect and why · Sharing with payout partners (consent and ledger) · Retention and deletion |
| Payments | Funding (routes per source) · **Supported cryptocurrencies & networks** (generated at build time from `lib/partners/registry.ts` and the providers' token lists, with the snapshot date shown) · The route engine (three lanes, policies, home lane and its disclosed difference) · Fees · Limits · Corridors (MYR, PHP, IDR status) |
| Evidence | What is recorded · Verify an anchor (step by step with a digest) · Auditor access (Seal grants) |
| Zeke | What Zeke can and cannot do · Models and data use (Anthropic, zero data retention) |
| Risk disclosures | Stablecoins and depeg (USDT named) · Networks and halts · Bridges and CCTP V1 · Self-custody |
| Legal | Terms · Privacy (PDPA) · "Splash is not yet a licensed money-services business" · Complaints |
| Status | Network status · Changelog |

- **Compliance overview page** must state, in this order:
  1. what Splash is (software)
  2. who holds money (the business; partners at the fiat edge)
  3. the tiers
  4. screening
  5. partner data sharing
  6. what Splash is not
- **Security overview** must state:
  - key custody (no Splash key)
  - what Splash's operational keys can do: pay fees only. The Sui anchor/storage key (SUI, WAL), the Kora fee payer (SOL), the Pimlico paymaster deposit (ETH on Arbitrum), and the SAS/EAS attester keys. None can move client funds
  - that the recovery kit is generated by open-source JavaScript Splash serves (published hash), and that "bring your own kit" exists
  - salt handling
  - request signing to partners
  - incident contact
- `content/docs` and `app/docs` use the new **docs** surface from §4.6: claims rules apply, the jargon rule doesn't.
- **Acceptance:**
  - [ ] Every page exists, has no placeholder text, and links from the nav.
  - [ ] `check-copy` passes over `content/docs`.

## 6. Funding (`v15/funding`)

- **Fund screen:** one USD balance; per-lane/token detail behind a tap. Funding lands only on the three lanes (Sui, Solana, Arbitrum).
- **Sources:**

| Source | How it reaches the wallet |
|---|---|
| Sui deposit QR | Direct (USDC can be gas-free; USDsui and SUI swap to USDC) |
| Any coin on Solana, Arbitrum, Ethereum, Base or Polygon that a provider accepts | Connect wallet (wallet-standard / wagmi), then LI.FI or Socket (EVM and Solana), Jupiter (Solana swaps), Mayan (anything into Sui). Lands as USDC or USDT on a lane |
| USDsui | Shows a "Swap to USDC" action (Cetus/7K/Aftermath, partner fee 0) |
| MYR from the business's own bank | Info card: "Withdraw native USDC from your SC-registered exchange to this address" |

- **Controls (tests for each):**
  - destination locked to the business's own address
  - destination token on the allowlist (native USDC/USDT only)
  - KYT on both addresses before building
  - EVM approvals for the exact amount
  - LI.FI's 0.25% swap fee shown when present
  - Splash integrator fee 0 everywhere
  - for volatile coins (ETH, SOL, SUI): price impact and quote expiry shown before signing
- Socket has no Sui route. Don't call it for Sui.

## 7. Route engine (`v15/route-engine`, new package `packages/route-engine` shared by all three builds)

- Implement `RouteQuote` exactly as in Business Module §4.5 (sources are only `sui | solana | arbitrum`; targets are any network in the registry), plus the registry `lib/partners/registry.ts` (in `lib/` so the copy guard exempts it):
  ```ts
  { id, countries, acceptedTargets: Array<{network, token}>, rails, signed: boolean, sandbox: boolean }
  ```
  Initial values: Noah `solana, polygon, base, ethereum` USDC; PDAX `solana, arbitrum` USDC; DurianPay `polygon` USDC/USDT (unconfirmed).
- **Supported assets list** = funding tokens from the providers' live lists (filtered) ∪ lane balances (USDC/USDT on the 3 lanes) ∪ the registry's delivery targets. Expose it at `GET /api/supported` and snapshot it into the docs at build time.
- **Adapters:** `lifi.ts` (`/advanced/routes`), `socket.ts` (`/v3/swap/quote`), `mayan.ts` (`fetchQuote`, flag `cctp_v1` on any MCTP leg touching Sui), `cctp.ts` (direct V2 from Solana or Arbitrum, with `mintRecipient` = the partner's deposit address on any V2 network, e.g. Polygon or Base), and partner quotes (`noah.ts`).
- Parallel fan-out with a 2.5 s timeout; normalise; rank by policy.
- **Home-lane rule:** a route sourced from `ENGINE_HOME_CHAIN` wins if within max(US$1, 0.02%) of the best, **and the quote shows the difference** with a "Switch to cheapest" action. It never applies when the business picks "strictly cheapest".
- **Fee-cap rule:** on tickets from US$2,000, reduce the Splash fee to a 0.05% floor and waive the US$2 minimum, then flag `above_target`.
- **Env:** `ENGINE_HOME_CHAIN=sui`, `ENGINE_LANES=sui,solana,arbitrum`. Delivery networks come from the registry, not the env.
- **Evidence** stores the quoted route and the executed route.
- **Acceptance:**
  - [ ] Unit tests: ranking per policy; home-lane tie-break; fee cap; expiry ≤ 60 s; a provider timeout doesn't break ranking.
  - [ ] Recorded fixtures for one US$10,000 PHP payout.
  - [ ] A live testnet run at US$1.

## 8. Partner adapter: Noah first (`v15/noah-adapter`)

- **Sandbox:** `business.sandbox.noah.com`. Read docs.noah.com: Global Payout, Automated Payout, Channels, Business Customer Prefill, Hosted Onboarding, Webhooks, Request Signing.
- **Calls:**
  1. `GET channels/sell?Country=MY|PH|ID`
  2. `POST /onboarding/:CustomerID/prefill` with `type: BusinessCustomerPrefill`
  3. `POST /onboarding/:CustomerID` (hosted session; the page emits a `kycCompleted` postMessage, but the **Customer webhook is the source of truth**)
  4. Beneficiary + payout
  5. Deposit address per payment on Solana or Polygon (Polygon is reached by CCTP V2 mint from a Solana or Arbitrum balance)
  6. Signed webhooks into evidence
- **Request signing is required in production.** Keep keys in the secret store, never in the repo.
- **Sumsub token share for directors and UBOs only.** Company token share is not supported by Noah.
- **Invariant test:** a payout's destination is the business's address or the partner's per-payment deposit address, never a Splash address.
- **Then:** PDAX (Solana/Arbitrum) and DurianPay (Polygon) adapters behind the same interface, both `signed: false`.

## 9. Evidence (`v15/evidence`, rebased from `feat/v15-splash-evidence`)

- **Reader identity (fixes two problems):**
  - Allowlist members are each authorised person's **reader address**: their zkLogin address on Sui, or a per-person non-extractable device key mapped to a Sui address on the Solana and Arbitrum builds.
  - Never a multisig: a Seal session key needs one signature, and a multisig session would need two people just to read a receipt.
  - Never a recovery kit.
  - A mode migration or a staff change updates the allowlist in the same flow.
  - The shared allowlist still links a payer's readers to a recipient's readers. Document it; per-bundle derived reader addresses are the later fix.
  - Update `splash_evidence::allowlist` docs and tests; Sebastian reviews.
- **Walrus:**
  - Splash's own authenticated publisher; `permanent=true`; 53 epochs; a renewal job.
  - Quilts by customer and retention class.
  - Remove `epochs: 5` in `walrus.ts`.
- **Seal:**
  - Decryption by the requester's own session key.
  - Remove the operator-key decrypt and the mock fallback (`seal.ts:72`, `128-184`).
- **Anchors:**
  - `anchor_for` per bundle now.
  - A batched Merkle root via authenticated events once volume passes ~1k a day.
  - Emit the same root for the Solana (SAS) and EVM (EAS) builds.
- **Write** an anchor for the live USDC lane (`lib/server/stablecoin-outflows.ts` must stop at `PENDING_MAINNET_PUBLISH` only until `splash_evidence` is published).
- **Bind receipts** to a real intent and coin movement: `receipt_v2::create_receipt` must stop trusting caller-supplied fields.
- Extend `scripts/check-core-no-balance.mjs` to `splash_evidence`.

## 10. Zeke (`v15/zeke-agents`)

- **Six agents** (Reader, Router, Checker, Planner, Matcher, Auditor) as described in Business Module §4.8. Each gets its own system prompt, tool list and zod output schema.
- **The Reader is tool-less:** files go in as PDF/image content blocks; output is JSON only.
- **Models:**
  - `ANTHROPIC_MODEL=claude-sonnet-5-5` for agents.
  - `claude-haiku-4-5-20251001` as the verifier only, behind an env var so it can be swapped before it retires (no sooner than 15 Oct 2026).
  - `claude-opus-5-5` for offline eval grading.
- **Remove:**
  - the WhatsApp APPROVE vote (`app/api/webhooks/whatsapp/route.ts`); WhatsApp becomes notification and intent capture only
  - the `AUTO_EXECUTE` outcome (`lib/policy/evaluate.ts`) for anything Zeke creates
- **Approval** is bound to a passkey or zkLogin challenge over the approval hash.
- **Eval gate** (`npm run eval:zeke`): golden and adversarial cases (poisoned PDF, a changed-bank-details email, prompt injection in an invoice memo, "pay now" in WhatsApp). Required result: **zero unauthorised actions**. It must run green before any stage demo.

## 11. What Sky needs from you, in order

| By | Deliverable |
|---|---|
| 5 Oct | §2 wallet (kit + modes) and §4 landing copy on branches, screenshots in the PRs |
| 6 Oct | Enoki salt live; walk-away test digest; one Splash ↔ Splash USDC transfer anchored on mainnet (digest); Noah sandbox `channels/sell` output for MY, PH, ID |
| 6 Oct | §10 removals done; `eval:zeke` green |
| 24 Oct | §5 docs site; §7 engine across the Sui + Solana lanes, with Polygon delivery via CCTP V2 mint (the Arbitrum lane lands with prompt 3); §9 evidence |
| 31 Oct | CCTP gate report: is Sui on V2 at Circle, do Mayan/LI.FI route it, and live exits at US$100 / 1,000 / 10,000 |

**Ask Sky, don't guess:**
- whether SPLASH MY SDN BHD is incorporated (`content/brand.ts` `legalEntity` stays `null` until it is)
- the production domain and support email
- which partners are signed (`signed: true`)
- whether to replace the locked `REQUIRED_HONESTY_SENTENCE` in `content/money-path.ts` and drop the Labuan line from `footerLegal` (v15 parks Labuan). Recommended: yes, to "Splash is not yet a licensed money-services business."
- the exact Overflow placing to print ("Top 4, DeFi & Payments" or "winner")
