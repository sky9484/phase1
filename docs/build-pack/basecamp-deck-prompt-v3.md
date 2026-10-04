# Splash · Sui Basecamp AI Builder Lab deck · Claude Design prompt v3

**Event:** Sui Basecamp 2026, Marina Bay Sands, Singapore (7–8 Oct, alongside TOKEN2049) · **Slot:** 2:45 PM, listed on the agenda as "Top Teams from Sui Overflow" on Day 1, 7 Oct ([CONFIRM on the official agenda]) · **Length:** cover + 5 pages
**Canon:** Business Module v15 draft (4 Oct 2026). UNCONFIRMED items are marked; nothing below names an unsigned partner.
**Replaces:** v1 (13 slides) and v2 (12 slides). Those were 10-minute raise decks. This is a 5-page lab slot, so one idea per page.

---

## Part A · Read before pasting (60 seconds)

**Five things this deck must not say. Each fails diligence, and all five were in drafts:**

| Don't say | Why | Say instead |
|---|---|---|
| "Noah / PDAX / DurianPay / GCash are our partners", or "licensed partners" | None is signed, and Noah's Malaysian payout entity isn't even disclosed yet | "Payout partners in MY, PH and ID" |
| "Max fee 0.33%" as a promise | Noah's rate card isn't in hand. If partner cost goes above 0.20%, you eat the difference | "All-in target ≤ 0.33% on tickets from US$2,000" (labelled TARGET) |
| "Sui is always first" | No payout partner we've verified takes USDC on Sui, so every bank payout leaves Sui | "Sui is home: accounts, approvals, free transfers and proof. Payouts leave on whichever chain the partner accepts" |
| "Gasless payments" | Only bare sends of allowlisted stablecoins are gas-free (USDT is not on the list). Splash's anchors pay gas | "Stablecoin transfers on Sui can be gas-free" |
| "Licensed", "yield", "escrow", "netting" | Not true today | "Splash never holds your money" (true by design in v15, see Business Module §4) |

**What changed since v2:** v15 is now **self-custodial** (the Splash cold key is gone; a recovery kit generated on the business's own device replaces it), **chain-agnostic** (three settlement lanes, Sui, Solana and Arbitrum, compete on every payment; supported coins and networks are whatever the payout partners and swap providers accept), and has **two KYC tiers** (Basic: stablecoin to stablecoin; Advanced: stablecoin to local bank). The Labuan "principal" story is off this deck.

**Sources used on slides** (all checked 3–4 Oct 2026):
- World Bank RPW, Malaysia→Philippines, Q3 2025: average 3.92%, banks up to 9.56%, FX margin 1.49% — remittanceprices.worldbank.org/corridor/Malaysia/Philippines
- MY–PH trade US$8.22B (2025) — The Edge Malaysia
- BIR RMC 098-2026: Philippine e-invoicing mandatory by 31 Dec 2026 — Grant Thornton PH
- McKinsey × Artemis (Feb 2026): stablecoin B2B payments ~US$226B/yr; Asia 60% of stablecoin payment volume
- Sui blog: gasless stablecoin transfers live 20 May 2026; ~390 ms finality (2 Sep 2026); confidential transfers in devnet beta since Jun 2026 (status post 18 Sep 2026); Basecamp theme "The next $5 trillion in transactions won't be human" (27 Aug 2026)
- Sui docs: up to 1,024 commands in one programmable transaction
- Circle: Sui is CCTP V1-only; V1 limits fall from 31 Oct, contracts pause 1 Dec 2026; Circle says Sui gets V2 before deprecation begins (developers.circle.com, read 4 Oct)

---

## Part B · Paste this into Claude Design

```
Design a 16:9 pitch deck: a cover plus 5 content pages, for Splash at Sui Basecamp 2026,
AI Builder Lab stage, Singapore. About 5 minutes on stage. The audience is Sui builders, Mysten
staff, ecosystem funds and angels. The decision we want: a follow-up meeting to invest in the
pre-seed, or to become a design partner.

══ BRAND SYSTEM (binding: it matches the live splash landing page) ══
Wordmark: "Splash". Never "Splashz".
Palette (use only these):
  paper            #FFFAF4   (deep #F8F0E5) - page background
  ink              #0C3E48   - text, rules
  teal             #0D6370   (dark #083640) - dark panels, primary data
  mint             #9FCFC7   - secondary data, lanes, quiet fills
  gold             #EFC46F   - ONE emphasis per page (the number or word that matters)
  muted            #6D7F86   - the "before" side of a comparison, captions
Type: Geist for everything; display headlines at weight 900–950 with tight tracking (-0.06em),
the second line of a display headline in gold. Geist Mono for numbers, chain names, module
names and source lines. Body is never under 20pt; source lines are 11pt.
Visual language: precise 30° isometric modules with a fixed vocabulary: wallet block, route
lane, payout-partner gate, bank/e-wallet building, evidence vault, approval key, agent desk.
One light direction (top-left), soft contact shadows, flat colour fills, no gradients, no
glow, no coins raining, no rockets, no stock photos, no robot faces with eyes.
Headlines are full-sentence conclusions, 10 words max. Body text 30 words max per page; move
everything else into speaker notes.
Footer on every content page, left: a small mono tag LIVE / BUILT / TESTED / PLANNED / TARGET for
the page's main claim. Right: "splash · Sui Basecamp 2026".
Never draw a partner logo. Never write a partner name. Never invent a number; anything in
[BRACKETS] renders as a dashed-outline chip.

══ COVER (not counted) ══
Headline (display, two lines):  "Pay any supplier in Asia."  /  "Keep the proof."   (line 2 gold)
Sub (one line): "Self-custodial stablecoin settlement for Southeast Asian businesses. Home on Sui."
Chips (mono): "[CONFIRM: Top 4 · Sui Overflow 2026, DeFi & Payments]"  ·  "Sui Basecamp · 7 Oct · 2:45 PM"  ·  "MY → PH · ID"
Visual: one isometric business wallet block on the left, three thin route lanes leaving it, the
lane marked SUI drawn slightly thicker and closest to the viewer, all three lanes ending at a
single gold gate and a small bank building beyond it. A small sealed evidence vault sits
under the wallet.
Speaker note: "I'm Sky. Splash lets a Malaysian business pay suppliers in the Philippines and
Indonesia in stablecoins, delivered to their bank, with proof the auditor accepts. We never
hold the money."

══ PAGE 1 · THE PAIN ══
Objective: the room feels the cost and the missing proof in 20 seconds.
Headline: "Small payments to the Philippines cost up to 9.56%."
Hero number (huge, gold): "9.56%"   label: "bank price, MY → PH"
Two small stat cards beside it: "3.92% corridor average" · "1.49% hidden in the FX rate"
Bottom strip, five isometric objects on pedestals with snapped threads between them:
  Invoice (email PDF) · Approval (chat thumbs-up) · Payment (bank portal) · FX rate (screenshot)
  · Tax e-invoice (government portal). A faceless auditor figure holds a magnifier.
  Caption under the strip (≤ 10 words): "One payment. Five systems. No link between them."
Gold date chip at the far right: "31 Dec 2026 · PH e-invoicing deadline for covered taxpayers"
Source lines: "World Bank Remittance Prices Worldwide, MY→PH, Q3 2025 (US$200/500 sends)" ·
"BIR RMC 098-2026"
Tag: LIVE (public data)
Speaker note: "This is the only public price data for the corridor, measured on US$200 and US$500
sends; percentages fall as amounts grow, so treat it as the small-ticket picture, not a B2B quote.
Price is half the pain. The other half: the invoice is in
email, the approval in WhatsApp, the payment in a bank portal and the rate in a screenshot.
By 31 December the Philippines requires e-invoices from covered taxpayers. Splash exists because the money
moves but the proof doesn't. [SKY: one true sentence from your own trade-ops or banking years
about a payment you couldn't prove. Cut this line if you don't have one.]"

══ PAGE 2 · THE SOLUTION: ONE ENGINE, THREE LANES ══
Objective: show the mechanism in one diagram and why it is cheaper and provable.
Headline: "Three chains compete for every payment. You keep the proof."
MAIN VISUAL (60% of the page): an isometric left-to-right system diagram, five stations
connected by lanes, every station labelled in Geist Mono:
  1 FUND      "Any wallet, any coin our swap providers accept" - small tokens (USDC, USDT, ETH,
              SOL, SUI) entering through a router gate labelled "swap and bridge providers",
              leaving it as USDC or USDT.
  2 WALLET    a wallet block labelled "Your business wallet · self-custody". Two small keys
              hang on it: "Google sign-in (zkLogin)" and "Recovery kit · made on your device".
              A tiny chip: "Splash holds no key" [tag BUILT only if the self-custody wallet
              branch is merged by 6 Oct; otherwise PLANNED].
  3 ENGINE    three parallel lanes labelled SUI · SOLANA · ARBITRUM racing toward the right,
              each carrying a small quote card; SUI is the lane nearest the viewer. Above the lanes, three selector pills:
              "Cheapest" · "Fastest" · "Safest" (Cheapest highlighted in gold). A small agent
              desk above it labelled "Zeke recommends", with a person holding an approval key
              labelled "You approve".
  4 DELIVER   a gold gate labelled "Payout partner · on the network it accepts", then a bank
              building and a phone-wallet icon, with currency chips MYR · PHP · IDR. A side path from the
              wallet runs straight along the SUI lane to another wallet labelled
              "Splash to Splash · free".
  5 PROVE     a vault beneath the whole diagram, a thin line rising from every station into
              it. Label: "Invoice · approval · KYC tier · route quoted vs executed · partner
              confirmation → encrypted on Walrus, access by Seal, anchored on Sui".
Right-hand rail, three small stacked facts (each ≤ 8 words):
  "Ranked by local currency the supplier receives"
  "Free between Splash businesses on Sui"
  "All-in target ≤ 0.33% on US$2k+ payouts"   (mono tag TARGET beside it)
Tag: BUILT (Sui lane) · PLANNED (Solana and Arbitrum lanes, partner payouts, evidence anchor until
splash_evidence is published). Upgrade a tag to BUILT only if it is merged and demoable on 6 Oct.
Speaker note: "Fund from any wallet, with any coin our swap providers accept. It becomes USDC or USDT
in your own wallet, which you open with Google and back up with a recovery kit made on your
device. We hold no key, so we can't move your money. When you pay, our engine asks Sui, Solana
and Arbitrum for routes and ranks them by how many pesos or rupiah your supplier actually
receives. Pick cheapest, fastest or safest. Zeke recommends, you approve, and a payout partner
pays the supplier's bank on whatever network it accepts. Every step lands
in one encrypted evidence record your auditor can open. Payments between Splash businesses on
Sui are free. Payouts target 0.33% all-in from US$2,000."

══ PAGE 3 · AGENTIC FINANCE: ZEKE ══
Objective: the AI Builder Lab audience sees a serious agent design, not a chatbot.
Headline: "Zeke runs your payables. It can never pay."
Visual: an isometric agent desk (a calm, faceless desk console, not a humanoid robot) on the
left, six small module cards orbiting it, each with one icon and a 2–3 word label:
  Reader    "reads invoices"
  Router    "picks the route"
  Checker   "pre-checks limits"
  Planner   "plans cash needs"
  Matcher   "reconciles payouts"
  Auditor   "builds evidence packs"
A hard vertical wall down the middle of the page, labelled "authority boundary" in mono.
Only one arrow crosses the wall, labelled "DRAFT". On the right side of the wall, three steps
in teal: "Policy check" → "You approve (passkey)" → "Chain executes". A small X sits on
a dotted arrow from the agent straight to a key, labelled "agent → signature: blocked".
Bottom line (≤ 12 words): "A wrong draft must pass policy and a person."
Small "next" chip, top right, tag PLANNED: "Next: spending limits you set, enforced on-chain"
Tag: BUILT (proposal + approval flow, once WhatsApp approval votes and AUTO_EXECUTE are removed by 6 Oct;
otherwise PLANNED) · PLANNED (Planner, Matcher, on-chain spending limits)
Speaker note: "Zeke is six narrow agents, not one chatbot. The Reader opens invoices in
quarantine with no tools, so a poisoned PDF can't make it do anything. The Router explains our
engine's quotes in plain words. The Checker reads deterministic results: your KYC tier, your
limits, the screening result. Zeke holds no key. Its only output is a draft. Policy runs as
code, a person approves with a passkey, and the chain executes. Next we use Sui's scoped
authority so a finance team can set limits like 'these five suppliers, up to US$10k a month'
and the chain enforces them, not us."

══ PAGE 4 · WHY SUI ══
Objective: a specific, current answer only a Sui-native team gives, including what Sui doesn't do.
Headline: "On Sui, stablecoins move gas-free and proof is native."
Layout: a 2 × 3 grid of isometric tiles, each with one mono label, one number or date, and one
line saying what Splash uses it for:
  "Gasless stablecoins · live 20 May 2026"         → "Free payments between Splash businesses"
  "~390 ms finality (Sui-reported)"                → "Approvals settle while you watch"
  "zkLogin"                                         → "Google sign-in becomes a self-custody wallet"
  "Up to 1,024 commands in one transaction"         → "Batch 30 supplier payments, all or none"
  "Walrus + Seal"                                   → "Encrypted evidence only your auditor opens"
  "Confidential transfers · devnet beta"            → "Next: private amounts, auditor can still see"  (tag PLANNED)
Bottom band, dark teal panel, gold text (≤ 16 words):
  "Sui keeps the record, the approvals and the free transfers. Payouts leave on the partner's chain."
Source line: "Sui blog, 20 May / 2 Sep / 18 Sep 2026 · Sui docs"
Tag: LIVE (Sui features) · PLANNED (confidential)
Speaker note: "Three reasons we're Sui-native. First, plain sends of allowlisted stablecoins like USDC
can be gas-free, so a Philippine agent who receives from us can pay onward for free. Second, zkLogin turns a Google
login into a real wallet whose proof validators check, with no browser extension; the recovery
kit is only a backup. Third, Walrus and Seal give us encrypted evidence with access control
written in Move. We're honest about the edge: no payout partner we've found takes USDC on Sui yet,
so bank payouts leave from Solana or Arbitrum, delivered on the partner's network. The more volume stays inside Sui, the
less that exit matters, and that's the number we'll report."

══ PAGE 5 · THE RAISE ══
Objective: one specific ask tied to milestones.
Headline: "Raising [US$ AMOUNT] pre-seed to open three corridors."
Left column, hero number in gold: "[US$ AMOUNT]"  label: "pre-seed · [INSTRUMENT, e.g. SAFE]"
  Under it, three milestone chips in a row, each with a mono tag:
  "3 signed design-partner LOIs"  ·  "1 signed payout partner"  ·  "US$1M a month settled"
Centre: use-of-funds bar (one horizontal stacked bar, labelled percentages, no pie):
  Team & engineering [%] · Security audits [%] · Legal & licensing opinions [%] ·
  Partner integrations & infra [%] · Go-to-market [%]
Right column "Shipped" (three lines, mono ticks):
  "Top 4 · Sui Overflow 2026"
  "[N] automated tests passing"
  "[MAINNET / TESTNET] USDC lane"
  Team strip under it: "Sky · Founder & CEO" · "Sebastian · CTO, Move"
Bottom line: "Talk to us if you pay suppliers in the Philippines or Indonesia every month."
Contact chip: "[EMAIL] · [DOMAIN]"
Tag: PLANNED
Speaker note: "We're raising [amount] to do three things in [months]: sign our first
payout partner, convert three Malaysian forwarders into design partners, and settle US$1 million
a month. We'd rather show you a zero than hide it: today we have [N] signed LOIs. If you pay
suppliers in the Philippines or Indonesia, you're who we want to talk to after this."

══ APPENDIX (not presented; one visual each, no paragraphs) ══
A1 The route engine: one quote table for a sample US$10,000 payout, three lanes × three policies,
   columns: route, ETA, total cost, local currency received. Every cell [INPUT: live quote].
A2 Self-custody: the wallet key diagram. Default = admin or recovery kit signs. Two-signature mode =
   any two of admin, approver and two custodian kits. "Splash holds no key."
A3 KYC tiers: Signed in (receive) → Basic (stablecoin to stablecoin, US$5k/day) → Advanced
   (stablecoin to local bank, through the payout partner's own KYB).
A4 Q&A cards: "Are you licensed?" · "What if Zeke hallucinates?" · "Why not just Wise?" ·
   "What happens on 1 Dec when Circle pauses CCTP V1 on Sui?"

══ HARD RULES ══
- Never write: licensed (about Splash or its partners), yield, escrow, netting, autonomous, gasless payments,
  guaranteed fee, instant off-ramp, any partner or bank name, any logo.
- One gold emphasis per page. One message per page.
- Every number has a source line or a TARGET/[INPUT] tag.
- Sui facts are credited to Sui ("Sui-reported", "Sui blog"). Splash facts carry module names in
  mono where they appear: splash_core, splash_evidence.
```

---

## Part C · Inputs only you can fill (the deck isn't shareable until these are in)

| Page | Input | Recommendation |
|---|---|---|
| Cover | Day of the slot (7 or 8 Oct) | Check the Basecamp agenda |
| 1 | One true founder sentence | Your glove-export ops or Citibank years. If it isn't true word for word, cut it |
| 5 | Amount and instrument | Defense-book proposal: **US$1.5M, first close US$750k, SAFE** (UNCONFIRMED). The payments expert told you a 7-figure ask; US$550k is too small |
| 5 | Use-of-funds % | Proposal for v15 (no custody, so the Labuan RM1.5M paid-up moves to the seed round): team 50 · audits 10 · legal/licensing opinions 12 · partner integrations & infra 13 · GTM 15 |
| 5 | Test count, mainnet or testnet | 1,099 Node tests at 3f78f5a + 21 `splash_evidence` Move tests on branch. Say "mainnet" only if a real transfer digest exists |
| 5 | LOI count | K4 is 0 today. Show the real number |
| 5 | Email and domain | `content/brand.ts` defaults to splash.finance / support@splash.finance; earlier decks used splashz.xyz. Pick one before printing |

## Part D · Three questions you'll get, and the 20-second answers

1. **"You're unlicensed. Who actually pays the peso?"**
   "A payout partner in each country, and the business is that partner's own customer. We're software. We never hold the money: your wallet's keys are made on your device, and no key of ours can move it."
2. **"Sui has no payout partners. Why build here?"**
   "Because the money that stays is free and provable on Sui: payments between businesses, approvals, evidence. Payouts leave on the partner's chain, and our engine picks it. The share of volume that stays on Sui is the metric we'll report."
3. **"Circle pauses CCTP V1 on Sui on 1 December."**
   "Circle says Sui moves to V2 before deprecation starts, and we plan for that, but we don't depend on it. Our gate is 31 October: if Sui isn't on V2 with working routes, payouts fund from the Solana or Arbitrum lane and Sui keeps the record. The customer sees no difference."
