# Arbitrum earns its place as a payout rail

Arbitrum One works as an additional payout rail under Splash's Sui record layer. It breaks wherever the plan asks it to do more than that. The money layer is sound. Arbitrum has Circle-native USDC worth about **US$2.37B** and full CCTP V2 support, an ERC-20 transfer cost about **US$0.003** on 2 October 2026, it holds an L2BEAT Stage 1 rating, and its May–October 2026 status history shows no sequencer outage ([DefiLlama](https://defillama.com/stablecoins/Arbitrum); [Arbiscan](https://arbiscan.io/gastracker); [L2BEAT](https://l2beat.com/scaling/projects/arbitrum); [Arbitrum status](https://status.arbitrum.io/history)). Its strongest argument is structural. If a Philippine venue such as Coins.ph or PDAX accepts native Arbitrum USDC for business payouts, a Malaysia→Philippines payment never crosses the Sui bridge. That bridge is the route Circle's CCTP V1 shutdown hits: burn limits start falling on **31 October** and the V1 contracts pause on **1 December 2026** ([Circle](https://www.circle.com/blog/migrate-to-cctp-v2-ahead-of-cctp-v1-legacy-deprecation)). Almost everything else is weaker than you assume. USDC on Arbitrum has no memo field, so invoice reconciliation needs Splash's own router events or EAS attestations. There is no zkLogin, so the identity half of Splash's identity-plus-passkey split would move into a wallet vendor's secure hardware. Stylus contracts stop working if nobody reactivates them each year. On payout reach, Arbitrum appears on **6 of the 11** payout and ramp partners checked, against 9 each for Base, Polygon and Solana, and none of the six is an African off-ramp or an Indonesian route. Walrus and Seal work from Arbitrum only through a Splash-run publisher paid in SUI and WAL, and through access policies written in Move on Sui. The Arbitrum build is therefore never free of Sui, and that is the right design for a rail under one record layer. Your wider claims fare as follows. Make the Philippines the main destination market and Indonesia the second, with Malaysia staying the origin, because neither country lets an unlicensed offshore app take its residents as customers. The Philippines does almost no business with Africa: it exported **US$7.02M** to Nigeria in 2025 ([TradingEconomics](https://tradingeconomics.com/philippines/exports/nigeria)). Onramper does list FPX, but nothing shows FPX buying USDC on Arbitrum, and none of its Malaysian providers is registered with the Securities Commission (SC). Kaia's portal is worth learning from as a way to assemble disclosed third-party rails; SwapScanner itself runs only on Kaia and has nothing to teach. The better plan has five parts. Keep one record layer on Sui, with Walrus and Seal. Build one portable EVM rail: a Safe owned by passkeys, a Solidity router that holds nothing and logs invoice references, and EAS attestations of each period's root. Deploy it on Arbitrum first only if a Philippine venue confirms Arbitrum USDC in writing by mid-October. Keep Base ready for GCash and Africa. Charge for proof, payouts and verified exits, never for the transfer itself.

## Five claims hold on Arbitrum and five break

The table scores your claims and the Arbitrum build against the evidence. "Holds" means the evidence supports the claim as designed. "Breaks" means a cited fact in the sections below defeats it. Every fix is a proposal and stays UNCONFIRMED until you trigger the next canon version.

| # | Claim or plan | Verdict on Arbitrum | The fact that decides it | Fix (proposal, unconfirmed) |
|---|---|---|---|---|
| 1 | Arbitrum reaches the Philippine payout venues | **Holds, unconfirmed at token level** | Coins.ph runs "Arbitrum One Network Transfers". PDAX announced USDC on Arbitrum on 1 Dec 2025. GCash's GCrypto lists USDC only on Ethereum, Avalanche and Base | Before mainnet, get written confirmation of native USDC, B2B disbursement and per-payment deposit addresses |
| 2 | Native USDC and CCTP V2 make a clean money rail | **Holds** | Native USDC is redeemable 1:1 and listed by exchanges; bridged USDC.e has neither property. CCTP V2 runs on Arbitrum with Fast Transfer as a source | Accept native USDC only; the router refuses USDC.e |
| 3 | Cheap and reliable enough for B2B | **Holds, with governance caveats** | About US$0.003 per transfer and no sequencer outage May–Oct 2026. But there is one sequencer, the Security Council can upgrade instantly, and forcing a transaction through Ethereum can take up to a day | Show stalled-network states; have answers ready on these governance powers for diligence |
| 4 | Arbitrum takes the bridge out of the money path | **Holds if row 1 is confirmed** | A payment from payer to venue on Arbitrum never touches CCTP V1. Arbitrum↔Sui transfers still do | Settle Philippine payouts on Arbitrum; send evidence to Sui, not money |
| 5 | The zkLogin identity and passkey authority split carries over | **Breaks** | Arbitrum has no zkLogin equivalent. Embedded wallets bind identity through vendors' secure enclaves. Splash's canon declined to adopt Privy | Keep zkLogin identity on Sui; make passkeys the Safe owners |
| 6 | Audit-grade evidence works the same way | **Breaks as built; fixable** | USDC has no memo, ERC-7699 is still a draft, and Arbitrum's EAS deployment is version 0.26 | The router emits the invoice reference in the same transaction; EAS carries each period's root |
| 7 | Stylus for the payment core | **Breaks** | A Stylus contract "becomes uncallable" unless it is reactivated every 365 days | Write the core in Solidity |
| 8 | Arbitrum serves Indonesia and Africa | **Breaks** | DurianPay takes Ethereum, Polygon, Tron and BNB Chain. Yellow Card, Busha and Kotani Pay list no Arbitrum | CCTP V2 hop to Polygon for Indonesia; Base or Solana for Africa |
| 9 | "The Philippines or Indonesia can be main" | **Half right** | Both regulate by where the customer is, and a Labuan entity carries no passport into either | Philippines as main destination, Indonesia second, Malaysia as origin |
| 10 | Onramper's FPX support "is massive" | **Breaks as stated** | FPX appears on a country page with no mapping to a provider, asset or network. No listed Malaysian provider is SC-registered. Off-ramps pay the seller, not a supplier | Restrict providers, take no fee, and use direct B2B partners for payouts |
| 11 | Walrus stays in use on Arbitrum | **Holds** | HTTP publishing plus an EAS anchor works from any chain. Storage payment and Seal policies stay on Sui | Splash-run authenticated publisher; Seal access through Sui identities |

Two findings cut across the table. The first is that **Arbitrum's real contribution is subtractive**. Today every bank payout has to leave Sui: DurianPay's crypto product takes no Sui (Splash internal: `business-module-v15-DRAFT-2026-09-28.md` §7), and Arbitrum→Sui transfers ride CCTP V1 on the Sui side. If a Philippine venue accepts native USDC on Arbitrum, the Malaysia→Philippines payment settles on one chain. Only data then crosses to the record layer: the evidence goes to Walrus over HTTP and the batch root is anchored on Sui. That is the clean meaning of "an additional delivery rail under the same record layer". It rests on a confirmation nobody holds yet: that the venue accepts native USDC, as a token and not just a network, for business payouts.

The second is that **the internal line about Philippine partners has to change before Basecamp**. The defense book says "PH partners settle on Arbitrum/Polygon/Tron" (Splash internal: `vc-defense-book-2026-10-01.md` Q6), and the Basecamp deck prompt adds "no Sui" (Splash internal: `basecamp-deck_claude-design-prompt_v1.md`). The public evidence does not support either wording. Coins.ph's status page lists network transfers for Arbitrum One, Polygon, Base, Solana and Sui ([Coins.ph status](https://status.coins.ph/)). PDAX's posts cover Arbitrum and Polygon. GCash's GCrypto lists USDC only on Ethereum, Avalanche and Base ([GCash Help Center](https://help.gcash.com/hc/en-us/articles/9781218166041-GCrypto-coins-and-networks)). "No Sui" is unsafe to say on stage. "Settle on" implies agreements that are not public. And the extra chain GCash names is Base, not Arbitrum. Until a venue signs, say only that "Coins.ph and PDAX support Arbitrum USDC transfers".

### Where Arbitrum is stronger or weaker than Sui and Solana

| Dimension | Sui | Solana | Arbitrum One | Arbitrum's position |
|---|---|---|---|---|
| Native USDC and CCTP | Native USDC; CCTP V1 only | CCTP V2 with Fast Transfer | CCTP V2 with Fast Transfer, Forwarding and upfront fees | Stronger than Sui; level with Solana |
| Cost of a bare stablecoin transfer | US$0.00 for bare allowlisted transfers | 5,000-lamport base fee | About US$0.003 | Marginally weaker than Sui; immaterial |
| Invoice reference on-chain | None native; Payment Kit is paid | SPL Memo and Solana Pay reference keys | None native | Weaker than Solana; level with Sui |
| Identity from Google or email login | zkLogin, proof checked on-chain | No native equivalent | No native equivalent | Weaker than Sui; level with Solana |
| Passkey authority and business multisig | Native passkeys and multisig | P-256 precompile; Squads V4 | P-256 precompile; Safe with passkey module | Level |
| Philippine venue reach | Coins.ph network listing only | PDAX, Coins.ph network; Cebuana building | Coins.ph network; PDAX | Stronger than Sui; weaker than Solana |
| Indonesian and African reach | None for USDC | Yellow Card, Busha, Kotani, Fonbnk | Fonbnk only | Stronger than Sui; far weaker than Solana |
| Ramps with Southeast Asian local methods | None verified | Widest of the three | Second | Between the two |
| 2026 reliability found | Three halts in May | No full halt since Feb 2024 | No sequencer outage May–Oct | Stronger than Sui; level with Solana, with different risks |
| Attestation primitive | Authenticated events | Solana Attestation Service | EAS (v0.26) | Level |
| Distance from Walrus and Seal | Native | Needs a Sui-side publisher and policies | Needs a Sui-side publisher and policies | Weaker than Sui; level with Solana |
| Ecosystem money | US$25K fellowship found | US$250K accelerator, Solana founders only | Audit subsidy and gas credits | Best audit subsidy; no investment |

Sources for every row appear in the sections below.

## Native USDC and CCTP V2 work; Splash must build the missing memo itself

### The money layer is clean, cheap and on the right CCTP version

Arbitrum One has Circle-issued USDC at `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`. Arbitrum's docs describe it as "directly redeemable 1:1 for U.S. dollars" and supported by exchanges. A separate bridged token, USDC.e at `0xff970a61a04b1ca14834a43f5de4533ebddb5cc8`, has neither property ([Arbitrum docs](https://docs.arbitrum.io/arbitrum-bridge/usdc-arbitrum-one)). Circle's own payments network supports Arbitrum and warns that sending "bridged USDC… might result in a loss of funds" ([Circle CPN](https://developers.circle.com/cpn/stablecoin-payments/references/supported-blockchains)). That warning sets the first rule of the Arbitrum rail: the router refuses USDC.e, and every funding route ends in the native contract. Circle lists Arbitrum as CCTP V2 domain 3, with Fast Transfer as a source, the Forwarding Service and upfront fees ([Circle CCTP](https://developers.circle.com/cctp/cctp-supported-blockchains)). On that page Arbitrum has one feature Solana lacks (upfront fees) and sits a full protocol version ahead of Sui, which is still V1-only.

Cost does not separate the chains. On 2 October 2026 at 20:06 UTC, Arbiscan showed a gas price of 0.02 gwei at every speed and an ERC-20 transfer at about **US$0.003**, with ETH at US$2,667.41 ([Arbiscan](https://arbiscan.io/gastracker)). ArbOS 51 raised the minimum base fee from 0.01 to 0.02 gwei in January 2026 ([Arbitrum docs](https://docs.arbitrum.io/run-arbitrum-node/arbos-releases/arbos51)). ArbOS 61, scheduled for activation on 20 August 2026, lets Offchain Labs set the base fee anywhere "between 0.01 gwei and 0.10 gwei, inclusive" ([Arbitrum docs](https://docs.arbitrum.io/run-arbitrum-node/arbos-releases/arbos61)). Even at that ceiling a transfer would cost about US$0.015, if Ethereum data costs stay similar (my estimate). Sui's bare stablecoin transfer is free ([Sui blog](https://www.sui.io/blog/sui-launches-gasless-stablecoin-transfers)), but anything Splash adds to it makes it a paid transaction, so the real gap is fractions of a cent. Ignore l2fees.info, which still shows a 2021-era "throttled while in beta" note ([l2fees.info](https://l2fees.info/)).

The liquidity is real but mixed. DefiLlama counts **US$3.83B** of stablecoins on Arbitrum: USDC US$2.37B (62%), USDT US$845.8M and PYUSD US$361M ([DefiLlama Arbitrum](https://defillama.com/stablecoins/Arbitrum)). That is about eight times Sui's US$478.5M and under a quarter of Solana's US$16.69B ([DefiLlama](https://stablecoins.llama.fi/stablecoinchains)). Splash's invariant I7 ("USD-only, no client-denominated non-USDC") means the USDT and PYUSD pools can be swap sources at the edge but never client balances. Do not repeat the Arbitrum Foundation's "$70B+ average monthly stablecoin transfer volume" as payments activity ([AF H1 2026 report](https://docs.arbitrum.foundation/assets/files/ArbitrumFoundationBiannualReport2026H1-611395eb7aa19030d380fb8a957725c5.pdf)). It is gross on-chain volume that includes DeFi and exchange flows. Splash's own competitive research already warns that this kind of figure is mostly not commerce (Splash internal: `claude/stablecoin-b2b-payments-competitive-landscape.md`).

### Arbitrum to Sui is the one money route still exposed to 1 December

Circle still lists Sui (domain 8) as "supported only by CCTP V1 (Legacy)" ([Circle CCTP](https://developers.circle.com/cctp/cctp-supported-blockchains)). The schedule is firm. V1 burn limits fall from 31 October, and "CCTP V1 (Legacy) contracts will be paused on December 1, 2026, and any integration still pointing at them will stop transferring USDC crosschain" ([Circle blog](https://www.circle.com/blog/migrate-to-cctp-v2-ahead-of-cctp-v1-legacy-deprecation)). Circle's migration guide promises that "Sui will be supported by V2 before the deprecation begins" ([Circle migration guide](https://developers.circle.com/cctp/migration-from-v1-to-v2)). But Circle already missed its own target of V2 on Sui by the end of H1 2026 ([Circle blog, Nov 2025](https://www.circle.com/blog/cctp-version-updates)), and it has just ended USDC support on Noble, the only other V1-only chain ([Crypto Briefing](https://cryptobriefing.com/circle-discontinues-usdc-noble-cctp-v1/)).

The route's speed today comes from the same V1 dependency. Under V1, a transfer that starts on Arbitrum waits about 13 to 19 minutes for source-chain confirmations ([Circle V1 confirmations](https://developers.circle.com/cctp/v1/required-block-confirmations.md)). That is why Splash's own Mayan test took about 20 minutes to move 1,500 USDC from Arbitrum to Sui, arriving as 1,499.30 (Splash internal: `vc-defense-book-2026-10-01.md`).

If V2 has not reached Sui by 1 December, the only verified route for native USDC between Arbitrum and Sui is Mayan's solver-based Swift. It charges no protocol fee and handles up to about US$1M per order ([Mayan docs](https://docs.mayan.finance/)). Allbridge, the other non-CCTP route to Sui in LI.FI's tables, does not list Arbitrum ([LI.FI tools](https://li.quest/v1/tools?chains=9270000000000000)). Arbitrum's routes to Solana, Base and Polygon all use V2 and are unaffected. The conclusion matches the scorecard: put Philippine payouts on Arbitrum itself, and let only evidence travel to Sui.

### No token-level memo, so Splash's router has to carry the invoice

Native USDC on Arbitrum is a standard token with no memo or reference field. ERC-7699, the Ethereum standard that would add one, defines `transfer(address,uint256,bytes transferReference)` and a `TransferReference` event "to associate transfers with orders/invoices". It is still a Draft, and USDC does not implement it ([EIP-7699](https://eips.ethereum.org/EIPS/eip-7699)). Splash therefore has to build the reference itself. There are three workable patterns, none confirmed by a vendor.

1. **A Splash router contract.** It pulls the exact amount with `transferFrom` and, in the same transaction, emits a `PaymentReference` event carrying the invoice hash and the evidence-leaf hash.
2. **Per-invoice deposit addresses created with CREATE2.** This is the Arbitrum version of DurianX's design of one deposit address per payment (Splash internal: `claude-code-prompt-v4-basecamp-mainnet.md`). Each deposit contract must be owned by the recipient's Safe and never by Splash; otherwise it becomes a Splash-held balance.
3. **An EAS attestation that points to the transfer's transaction hash.**

A fourth option would carry the invoice hash in the 32-byte nonce of USDC's EIP-3009 `transferWithAuthorization`, which would also be gasless for the payer. Whether Arbitrum's native USDC supports EIP-3009 was not verified.

| | Sui | Solana | Arbitrum One |
|---|---|---|---|
| Reference on the payment itself | None. Address-balance transfers offer "None" for receipts and duplicate prevention ([Sui docs](https://docs.sui.io/onchain-finance/choose-payments-model)) | SPL Memo of up to 566 bytes, plus Solana Pay `reference` keys ([SPL Memo](https://www.solana-program.com/docs/memo); [Solana Pay](https://docs.solanapay.com/spec)) | None; ERC-7699 is a draft |
| Built-in invoice dedupe | Payment Kit registry, always paid | Not native | Not native |
| What Splash must build | Indexer over accumulator events, plus a batched anchor | A memo convention, plus an SAS credential | A router event, CREATE2 addresses or EAS |

On reconciliation Solana is the strongest of the three, and Arbitrum and Sui tie. On Arbitrum the router is more than reconciliation plumbing; it is also where the zero-balance invariant has to live. Move enforces zero residue through its type system. Solidity has no such types, so the router must check that its own USDC balance change nets to zero on every call and revert if it does not. An auditor then verifies the invariant from the code and from invariant tests, not from the type system (my design inference). Approvals must always be for the exact amount, for reasons covered in the section on swap and bridge providers.

## Smart accounts are live, but identity would move into a vendor's enclave

Every building block Splash needs is live on Arbitrum One.

- **EIP-7702** "allows Externally Owned Accounts (EOAs) to set executable code" for delegation, batching, sponsorship and "privilege de-escalation". It shipped in ArbOS 40 ([Arbitrum docs](https://docs.arbitrum.io/run-arbitrum-node/arbos-releases/arbos40)) and went live on 18 June 2025 ([U.Today](https://u.today/ethereum-pectra-upgrade-arrives-on-layer-2-arbitrum)).
- **Passkey verification** has been cheap since ArbOS 31 "Bianca" added RIP-7212 support, which cut secp256r1 verification costs "by 99%" ([Arbitrum docs](https://docs.arbitrum.io/run-arbitrum-node/arbos-releases/arbos32)). ArbOS 51 added EIP-7951 support in January 2026 ([Arbitrum docs](https://docs.arbitrum.io/run-arbitrum-node/arbos-releases/arbos51)). EIP-7951 places `P256VERIFY` at address `0x100` at 6,900 gas and "supersedes RIP-7212… without the vulnerability" ([EIP-7951](https://eips.ethereum.org/EIPS/eip-7951)). Which gas schedule Arbitrum applies at that address was not verified. It matters only if a verifier contract hard-codes a gas amount.
- **ERC-4337 infrastructure.** Pimlico runs bundlers and paymasters on Arbitrum for EntryPoint v0.6 to v0.8, but its v0.9 bundler has no paymaster ([Pimlico](https://docs.pimlico.io/guides/supported-chains)). Pin v0.7 or v0.8 for sponsored flows.
- **Safe.** Safe's Transaction Service runs for Arbitrum ([Safe API](https://api.safe.global/tx-service/arb1/api/v1/about)). Safe's passkey module deploys a deterministic WebAuthn signer that becomes a Safe owner and can verify signatures through precompiles; audit reports exist for v0.2.0 and v0.2.1 ([Safe passkey module](https://raw.githubusercontent.com/safe-global/safe-modules/main/modules/passkey/README.md)). The Allowance module sets limits "specific to a Safe, token and delegate", either one-time or auto-renewing, but its README gives no audit information ([Safe Allowance module](https://raw.githubusercontent.com/safe-global/safe-modules/main/modules/allowances/README.md)).
- **Payer-side wallets.** Coinbase Smart Wallet supports passkey owners and references EntryPoint v0.6 ([Coinbase](https://raw.githubusercontent.com/coinbase/smart-wallet/main/README.md)), so Splash must expect payers on mixed EntryPoint versions.

What does not exist on Arbitrum is zkLogin. On Sui, an OAuth login becomes an address through a zero-knowledge proof that validators check, and a leaked salt "does not enable fund theft" ([Sui docs: zkLogin](https://docs.sui.io/concepts/cryptography/zklogin)). On Arbitrum, social or email login comes from embedded-wallet vendors, each with its own security design:

- **Privy** splits each key into an enclave share, decryptable only inside an AWS Nitro secure enclave (a TEE), and an auth share; "both shares are required in order to generate signatures" ([Privy](https://docs.privy.io/security/wallet-infrastructure/architecture)).
- **Turnkey** runs key generation, signing and policy evaluation inside secure enclaves, and states that "no single developer at Turnkey can alter or deploy enclaves, or reconstruct core secrets" ([Turnkey](https://docs.turnkey.com/security/our-approach)).

Both are serious designs, but trust moves from a proof anyone can check to a vendor's hardware and operations. Stripe also agreed to buy Privy in June 2025 ([Decrypt](https://decrypt.co/324674/payments-giant-stripe-acquire-crypto-firm-privy)). If Splash used either vendor, the honest label would be "self-custodial via third-party TEE key management", never "zkLogin-equivalent". Solana has the same gap, so identity is where Sui is strongest of the three chains.

| Splash role | Sui (canon) | Arbitrum option | Solana option |
|---|---|---|---|
| Identity from Google or email | zkLogin, checked on-chain | No native equivalent. Either a Privy or Turnkey TEE wallet, or the existing Sui zkLogin identity (proposal) | Embedded-wallet vendor |
| Authority to approve | Native passkey signer | Passkey as a Safe owner through the WebAuthn signer and the `0x100` precompile | Passkey smart wallet using the secp256r1 precompile |
| Business wallet | Native multisig | Safe with k-of-n owners | Squads V4 ([Squads](https://github.com/Squads-Protocol/v4)) |
| Bounded operator spending | Move policy | Allowance module, per Safe, token and delegate | Squads spending limits |
| Gas | Gasless bare transfers; Enoki sponsorship | ERC-4337 paymaster, or EIP-7702 for EOAs | Kora ([Kora](https://github.com/solana-foundation/kora)) |

The Arbitrum build also collides with three locked canon items. Each needs an explicit decision rather than a quiet workaround.

1. **Privy.** Canon records that Privy "was not adopted, because its policy engine would duplicate off-chain what Move enforces on-chain" (Splash internal: decisions log). Adopting Privy or Turnkey for the Arbitrum rail would reverse that decision.
2. **Subtractive powers.** Canon says Splash's powers over client accounts are "subtractive by type (freeze/deny only)". Safe warns that modules "can execute arbitrary transactions. Only add trusted and audited modules" ([Safe docs](https://docs.safe.global/advanced/smart-account-modules)). Any Safe module that Splash controls would hold exactly the write power canon forbids. On Arbitrum, Splash's compliance power belongs in its own router, which can refuse to route a flagged payment, and never inside the customer's Safe.
3. **Zeke.** Zeke is "structurally prevented from executing payments". An Allowance-module delegate is a key that executes payments. Zeke may therefore only draft Safe transactions for humans to sign, and allowances go only to named human operators, within limits.

The Sui multisig lesson (K11) carries over unchanged. If Splash holds a key at all, that key must never reach a Safe's threshold together with any single other owner.

### A design that keeps canon intact

This design is a proposal, UNCONFIRMED, and needs Sebastian's review.

- **Identity stays where it is.** The business signs in with Google through zkLogin on Sui. That gives it a Sui address for the record layer and for Seal.
- **Authority becomes the passkey on both chains.** Each approver's passkey is a Safe owner on Arbitrum through the WebAuthn signer. The same kind of key is already a native signer on Sui, where passkeys can sit inside multisig ([Sui docs: passkeys](https://docs.sui.io/concepts/cryptography/passkeys)).
- **Recovery** uses a Safe recovery module the customer chooses; Safe lists "social recovery" among the uses of modules ([Safe docs](https://docs.safe.global/advanced/smart-account-modules)).
- **Gas** comes from a paymaster or relayer. A relayer can delay a transaction but cannot alter one the owners have signed (inference).

One part of this is a hypothesis to test in a one-week spike, not a fact: whether a single WebAuthn credential can serve both as a Safe owner on Arbitrum and as a Sui passkey signer, so that each approver holds one passkey for both chains. If it can, the Arbitrum rail needs no embedded-wallet vendor at all.

EIP-7702 remains useful at the edge. A Malaysian forwarder paying from a MetaMask address could batch an exact approval and a payment into one sponsored transaction. It should not be the business wallet: by design, an EOA's original key keeps full control after delegation, so it remains a single point of failure.

## Solidity, EAS and a Stage 1 rollup, with one operator running the sequencer

### Stylus is a liability for a payment core

Stylus has been live on Arbitrum One since 3 September 2024 and lets contracts be written in Rust or C/C++ ([Arbitrum blog](https://blog.arbitrum.io/arbitrum-stylus-mainnet/)). Its own docs recommend Solidity "when the contract mostly reads and writes storage", which describes a payment router exactly. They also state the rule that rules Stylus out for Splash's core: contracts "need to be reactivated once per year (365 days) or after any Stylus upgrade… If a contract isn't reactivated, it becomes uncallable" ([Arbitrum docs](https://docs.arbitrum.io/stylus/gentle-introduction)). A payment rail that bricks itself when someone forgets a yearly transaction has a liveness bug built in. The tooling is also young: OpenZeppelin's 2024 review of the Rust SDK found "2 Critical Severity Issues" and "2 High Severity Issues" ([Arbitrum forum](https://forum.arbitrum.foundation/t/aip-activate-stylus-and-enable-next-gen-webassembly-smart-contracts-arbos-30/22970/39)). Write the router in Solidity. Leave Stylus for compute-heavy work later, and only with a reactivation runbook and monitoring.

### EAS is the asset

The Ethereum Attestation Service (EAS) is deployed on Arbitrum One at `0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458`. It runs contract version 0.26, which is older than Base's 1.0.1 built-in deployment and Polygon's 1.3.0 ([EAS contracts](https://raw.githubusercontent.com/ethereum-attestation-service/eas-contracts/master/README.md)). The EAS SDK supports:

- offchain attestations anchored on-chain with `timestamp` and `multiTimestamp`;
- `PrivateData`, which uses Merkle trees to reveal selected fields only;
- revocation;
- delegated (gasless) attestations;
- `refUID` links between attestations ([EAS SDK](https://raw.githubusercontent.com/ethereum-attestation-service/eas-sdk/master/README.md)).

That fits two Splash schemas (proposal):

1. **A KYB schema**, attested by Splash or its KYB vendor, holding only a status flag, a jurisdiction code and hashes. It contains no personal data.
2. **An evidence schema**, holding the period's Merkle root, the Walrus blob ID and the period end, linked to the KYB attestation by `refUID`.

Before building, check that version 0.26 supports the delegated-attestation features Splash needs. EAS is Arbitrum's counterpart to the Solana Attestation Service. Sui needs neither, because its authenticated events can already be verified by a light client ([Sui docs](https://docs.sui.io/develop/accessing-data/authenticated-events)).

### The rollup is mature by L2 standards and centralised by any standard

L2BEAT rates Arbitrum One Stage 1. It "passes the walkaway test", "anyone can be a Proposer", disputes are settled with interactive fraud proofs, all data is posted to Ethereum, and the rollup secures US$11.31B ([L2BEAT](https://l2beat.com/scaling/projects/arbitrum)). Three facts from the same page belong in Splash's risk register:

1. Regular upgrades wait 17 days 8 hours "unless upgrade is initiated by the Security Council in which case there is no delay". The Council is 9-of-12.
2. If the sequencer fails, users can force transactions through Ethereum, but with "up to a 1d delay".
3. L2BEAT names the risk that "the operator exploits their centralized position and frontruns user transactions".

The sequencer keeps a private mempool, so plain B2B transfers face no frontrunning from a public mempool (inference). The move from Timeboost to Priority Gas Auctions changes little for Splash, because supplier payments do not need priority. Offchain Labs proposed the switch on 3 June 2026, and L2BEAT logged it on 28 September ([Arbitrum forum](https://forum.arbitrum.foundation/t/constitutional-aip-transition-arbitrum-one-ordering-policy-to-priority-gas-auctions-pga/30942); [L2BEAT](https://l2beat.com/scaling/projects/arbitrum)). Reports of the vote date disagree ([Crypto Briefing](https://cryptobriefing.com/arbitrum-priority-gas-auctions-replace-timeboost/)).

The operator also holds two policy powers. One is the 0.01–0.10 gwei base-fee range. The other, in ArbOS 61, is "optional protocol-level filtering for regulatory purposes, gated behind an `ArbOwner` call" ([Arbitrum docs](https://docs.arbitrum.io/run-arbitrum-node/arbos-releases/arbos61)); whether it is switched on for Arbitrum One was not verified. A VC's diligence team will ask about all of these, so prepare the answers in advance.

### Reliability in 2026 favours Arbitrum over Sui

| | Sui | Solana | Arbitrum One |
|---|---|---|---|
| Worst 2026 incident found | Three mainnet halts on 28–29 May, "more than 15 hours" combined, traced to the address-balances upgrade ([Radom](https://www.radom.com/insights/recent-sui-mainnet-disruptions-linked-to-upgrade-flaw-developers-report); [CertiK](https://www.certik.com/blog/advancing-sui-the-evolution-of-suis-payment-pipeline)) | 12 Aug: a hosting failure took about 29% of stake offline, but "block production never stopped" ([Colosseum Codex](https://blog.colosseum.com/builder-station-sbpfv3-solana-resilience/)) | 13 May "Delays in posting an assertion", 9h 19m, graded degraded performance; no sequencer outage listed May–Oct ([Arbitrum status](https://status.arbitrum.io/history)) |
| Last full halt found | May 2026 | February 2024, about 5 hours ([Helius](https://www.helius.dev/blog/solana-outages-complete-history)) | None in the May–Oct 2026 history; 2024–2025 not verified |
| Structural single point | Payment-feature upgrades caused the halts | Concentration of hosted stake | One sequencer; instant Security Council upgrades |

Two cautions apply. First, posting assertions is how Arbitrum's state reaches Ethereum, so the 13 May delay touched settlement to Ethereum rather than whether transactions were included. That is my reading; the status page says only "degraded performance". Second, payout venues fail independently of the chain: Coins.ph put Arbitrum deposits and withdrawals under maintenance for about an hour on 5 February 2026 ([Pingoru](https://pingoru.io/providers/coinsph/incidents/63188)). Robinhood Chain's 4–14 minute stall in September happened on a separate chain built on Arbitrum's stack, not on Arbitrum One ([Crypto Briefing](https://cryptobriefing.com/arbitrum-robinhood-chain-transaction-delays/)).

### Grants buy audits and gas, not distribution

Arbitrum's 2026 support is generic. The Foundation's active programmes are:

- an Audit Program with "$10M in ARB over 12 months";
- ArbiFuel, a gas-sponsorship programme;
- Arbitrum Gaming Ventures;
- an Alchemy grant for Orbit chains.

None of them is specific to Asia ([Arbitrum Foundation](https://arbitrum.foundation/grants)). The H1 2026 numbers show how competitive they are ([AF H1 2026 report](https://docs.arbitrum.foundation/assets/files/ArbitrumFoundationBiannualReport2026H1-611395eb7aa19030d380fb8a957725c5.pdf)):

| Programme | H1 2026 result |
|---|---|
| Audit Program | Approved about **4%** of applicants; committed about US$1.42M |
| ArbiFuel | 19 teams approved; US$94,500 of gas credits, about US$5,000 per team (my calculation) |
| Open House buildathons | US$715,000 across New York and London |
| ARB01 mentorship | 13 teams selected from 902 applications |
| Strategic-partnerships budget | 250M ARB; 13 partnerships funded |

The institutional story is real but reported by the Foundation itself (same report). PYUSD peaked at US$475M on Arbitrum in Q1, Robinhood Chain launched its mainnet on 1 July, and the Foundation ranks Arbitrum "#1 by RWA deployments". It also says "Mastercard expanded stablecoin settlement support to assets on Arbitrum"; that claim was not checked against a Mastercard source. No 2026 programme for Southeast Asia, the Philippines or Indonesia was found.

The realistic asks are two. Apply to the Audit Program, because the router, the Safe configuration and the EAS schemas need an EVM audit anyway. Apply to ArbiFuel to sponsor approvers' transactions. Pitching Splash as Arbitrum's Southeast Asian settlement showcase under the strategic budget is an untested long shot.

Even so, this is the best audit subsidy on offer across the three chains. The only payments programme found on Sui was a four-week fellowship paying US$25,000 per team ([Sui blog](https://www.sui.io/blog/btcfi-payments-fellowship-on-sui)). Colosseum's US$250,000 accelerator invests only in founders with "some form of Solana integration" ([Colosseum](https://www.colosseum.com/accelerator)). Colosseum's Crypto World's Fair, which closes on 12 October, is the first Colosseum competition to accept other chains ([Colosseum blog](https://blog.colosseum.com/crypto-worlds-fair-crash-course-payment-channels/)), and a secondary source lists Ethereum-related tracks worth US$100,000 combined ([Crypto Briefing](https://cryptobriefing.com/colosseum-crypto-worlds-fair-hackathon/)). Whether an Arbitrum build qualifies for those tracks was not checked.

## The Philippines is the hub as a destination, and Philippines–Africa is a mirage

You are right that building offshore does not force Malaysia to be the main market. You are wrong about what "main" can mean, because the Philippines and Indonesia both regulate by where the customer is.

- **Philippines.** The SEC's crypto-asset rules "apply to all entities, local or foreign, that offer crypto-asset services to persons in the Philippines" ([BitPinas](https://bitpinas.com/regulation/sec-clarifies/)). They name wallet providers among covered services ([Aureada Law](https://www.aureadalaw.com/post/a-new-era-for-crypto-in-the-philippines-sec-tightens-rules-on-crypto-asset-service-providers-casps)) and require an SEC-registered corporation, a staffed Philippine office and PHP 100M of paid-up capital ([CryptoSlate](https://cryptoslate.com/crypto-laws/philippines-sec-casp-rules-guidelines-2025/)). The central bank (BSP) has frozen new licences for virtual-asset service providers (VASPs) indefinitely ([Fintech News PH](https://fintechnews.ph/68110/crypto/bsp-extends-moratorium-on-new-vasp-licenses-indefinitely/)). A September 2026 draft would also freeze new payment-operator registrations for 12 months; the latest coverage still describes it as unsigned ([Finance Magnates](https://www.financemagnates.com/fintech/payments/philippines-plans-12-month-freeze-on-new-payment-system-operator-registrations/)).
- **Indonesia.** Law 4/2026, in force since 17 June 2026, says "a stablecoin cannot serve as a direct means of payment" ([ABNR](https://www.abnrlaw.com/news/indonesias-p2sk-law-amendment-what-law-42026-changes-for-crypto-and-digital-financial-assets)). The financial regulator OJK's enforcement reach now covers "foreign parties serving Indonesian consumers" ([DFDL](https://www.dfdl.com/?p=67383)).
- **Labuan** changes none of this. Labuan entities need Labuan FSA approval before offering digital financial services ([Labuan FSA](https://www.labuanfsa.gov.my/areas-of-business/financial-services/digital-financial-services)), and they generally cannot serve Malaysian retail customers with regulated products ([Global Law Experts](https://globallawexperts.com/labuan-company-vs-sdn-bhd-malaysia-for-fintech/)).

"The Philippines or Indonesia as main" therefore works only in the destination sense. The money lands there through a licensed local partner, and the recipient is that partner's customer. Splash's own customers are the payers outside the country.

On that definition, make the Philippines the main destination, Indonesia the second, and keep Malaysia as the origin base.

- **Why the Philippines first.** It has the deeper licensed bench: at least seven operating VASPs, including UnionBank and GoTyme ([BitPinas](https://bitpinas.com/feature/list-licensed-virtual-currency-exchanges-philippines/)). Their stablecoin products are live. Coins.ph takes USDC and USDT payments at about 700,000 QR Ph merchants ([BitPinas](https://bitpinas.com/cryptocurrency/coins-ph-usdt-usdc-qrph/)), and PDAX Remit lets remittance companies and financial institutions "fund transactions in real time using stablecoins" ([PDAX](https://pdax.ph/remittance/)). Its IT and business-process services exports exceeded US$40B in 2025 ([Philstar](https://www.philstar.com/business/2026/01/29/2504140/it-bpm-revenues-breach-40-billion-mark/amp/)). It also has the only live e-invoicing deadline of the three countries: 31 December 2026 for identified taxpayers ([Grant Thornton PH](https://www.grantthornton.com.ph/insights/articles-and-updates1/lets-talk-tax/the-ber-months-are-here-the-countdown-to-the-e-invoicing-deadline-on-31-december-2026/)).
- **Why Indonesia second.** It has more goods trade, with a US$41.05B trade surplus in 2025 ([InfoSawit](https://en.infosawit.com/news/17217/indonesia---s-trade-surplus-hits-us-2-52-billion-in-december-2025-as-palm-oil-and-nickel-exports-rise)). Its corridor from Malaysia is also costlier: 4.80% average, against 3.92% to the Philippines ([World Bank RPW MY→ID](https://remittanceprices.worldbank.org/corridor/Malaysia/Indonesia); [World Bank RPW MY→PH](https://remittanceprices.worldbank.org/corridor/MY/PH)). But three things hold it back:
  - its payout stack is split between an OJK crypto licence and a central-bank payment licence;
  - its stablecoin rules bar use as payment;
  - DurianPay, Splash's planned route, runs its crypto leg through an entity in OJK's regulatory sandbox and is itself expanding into stablecoin cross-border payments ([ACV Capital](https://acv.vc/insights/acv-portfolio-news/durianpay-profitability-cross-border-expansion/); Splash internal: v15 §7).
- **Why not the rest.** Singapore required firms serving only overseas customers to cease operations from 30 June 2025 unless licensed ([CMS](https://cms.law/en/sgp/legal-updates/singapore-s-june-30-hard-deadline-for-crypto-firms-serving-overseas-customers)). Vietnam's pilot excludes fiat-backed tokens and requires settlement in dong ([US-ASEAN](https://usasean.org/article/vietnam-launches-five-year-pilot-program-regulate-crypto-trading)). Thailand allows USDC only as a listed asset on licensed venues ([Thailand Business News](https://www.thailand-business-news.com/banking/201121-thai-sec-broadens-cryptocurrency-offerings-by-adding-stablecoins-usdc-and-usdt)).

The first two corridors follow from this.

1. **Malaysia→Philippines B2B.** Malaysian freight forwarders pay Philippine destination agents, a licensed venue pays out in pesos, and the sale rests on BIR-ready evidence before 31 December.
2. **Malaysia→Indonesia B2B supplier payments**, on the DurianPay referral design, in which the Indonesian supplier is DurianPay's own merchant.

Payments from overseas clients to Philippine outsourcing firms are the biggest dollar pool. But serving them would make Filipino businesses Splash's own customers, which puts Splash inside the SEC's wallet-provider category. Leave that corridor until you have a Philippine legal opinion.

The fit with Arbitrum is uneven. Corridor one can settle natively on Arbitrum if a Philippine venue confirms it accepts Arbitrum USDC. Corridor two cannot. DurianX takes USDC on Ethereum, Polygon, Tron and BNB Chain (Splash internal: v15 §7), and DurianPay's public site shows no crypto acceptance on any chain ([DurianPay](https://www.durianpay.id/payment-in)). An Arbitrum payer therefore reaches Indonesia only through a CCTP V2 hop to Polygon. If you ever wanted Indonesia as the main market, the rail would be Polygon, not Arbitrum.

### The Philippines does not trade with Africa; Indonesia does, mostly in commodities

The Africa hunch is half right. The Philippines exported **US$7.02M** of goods to Nigeria in 2025 ([TradingEconomics](https://tradingeconomics.com/philippines/exports/nigeria)) and US$115.02M to South Africa, led by vehicles and electronics ([TradingEconomics](https://tradingeconomics.com/philippines/exports/south-africa)). There is no Philippine–Africa base to build on.

Indonesia is different by volume. In 2025 it exported US$674.94M to Nigeria, US$1.94B to Egypt and US$522.66M to Kenya ([TradingEconomics Nigeria](https://tradingeconomics.com/indonesia/exports/nigeria); [Egypt](https://tradingeconomics.com/indonesia/exports/egypt); [Kenya](https://tradingeconomics.com/indonesia/exports/kenya)). But palm-type fats and oils make up about 43%, 62% and 66% of those three flows. Indonesia's US$2.57B of imports from Nigeria are more than 95% mineral fuels ([TradingEconomics](https://tradingeconomics.com/indonesia/imports/nigeria)). These are commodity flows run by large traders, and they do not need a settlement app.

The addressable slice is non-commodity goods that Indonesian and Malaysian SMEs sell to Kenyan and Nigerian importers: paper, food preparations, pharmaceuticals, soaps, cosmetics and halal food. Indonesia's exports to Nigeria minus palm oil come to about US$385M (my calculation). Malaysia's lane to Kenya looks larger than its lane to Nigeria. Malaysia exported RM3.24B to Kenya in January–July 2025 alone ([Bernama](https://bernama.com/en/news.php?id=2465035)), against US$664M to Nigeria for the whole of 2025 ([Techeconomy](https://techeconomy.ng/nigeria-malaysia-trade-hits-1-23bn-in-2025)); the comparison assumes RM4.2–4.5 per dollar.

The payers' pain is real. Fewer than half of Nigerian manufacturers could get FX from the official window in Q3 2025 ([WeeTracker](https://weetracker.com/2026/07/14/nigeria-startup-stablecoins-africa-import-payments-crisis/)). But every documented case of stablecoin import payments concerns China, not Southeast Asia ([Afriex](https://www.afriex.com/post/how-african-businesses-pay-chinese-suppliers)), and the Africa→Asia business-payment fintechs found pay out in Chinese yuan, rupees or Pakistani rupees, not Southeast Asian currencies ([Nairametrics](https://nairametrics.com/2026/09/04/grey-expands-access-to-chinese-market-with-chinese-yuan-payout/); [Daba Finance](https://dabafinance.com/fr/nouvelles/afriex-remittance-expansion-asia-africa-cross-border-fintech)). This corridor would mean creating demand, not taking share from anyone.

The regulatory picture is mixed. Kenya's licensing regime is operational, with a licensing deadline of 4 November 2026 ([Spencer West](https://www.spencer-west.com/news/kenyas-virtual-asset-service-providers-regulations-2026-regulatory-framework-now-operational/)), but Kenya is on the FATF grey list ([AML UAE](https://amluae.com/fatf-grey-list-countries-update-19th-june-2026/)). Yellow Card's status in Nigeria is a conditional approval-in-principle that "is not a full licence" ([TechEconomy](https://techeconomy.ng/yellow-card-receives-conditional-approval-in-principle-for-admission-into-secs-arip)).

Investigate a corridor from Kenyan and Nigerian importers to Malaysian and Indonesian suppliers; do not launch one. As the next section shows, it would not run on Arbitrum anyway.

## Arbitrum reaches 6 of 11 partners checked; Base, Polygon and Solana each reach 9

The table counts which payout and ramp partners publicly list each chain for dollar stablecoins. It counts network support, not signed terms. Coins.ph's listings are network-level only, so which tokens it accepts on each network is unconfirmed.

| Partner (market) | Arbitrum | Base | Polygon | Solana | Sui | Source |
|---|---|---|---|---|---|---|
| Coins.ph (PH), network transfers | ✓ | ✓ | ✓ | ✓ | ✓ | [Coins.ph status](https://status.coins.ph/) |
| PDAX (PH), USDC | ✓ (Dec 2025) | not verified | ✓ (2022) | ✓ (2024) | not seen | [PDAX Arbitrum](https://learn.pdax.ph/post/pdax-learn-usdc-on-arbitrum-is-now-on-pdaxZ); [PDAX FAQ](https://learn.pdax.ph/post/faqs-on-the-use-of-alternative-networks-for-usdc-on-pdax); [PDAX Solana](https://learn.pdax.ph/post/usdc-for-solana-now-available-on-pdax) |
| GCash GCrypto (PH), USDC | ✗ | ✓ | ✗ | ✗ (PYUSD only) | ✗ | [GCash Help Center](https://help.gcash.com/hc/en-us/articles/9781218166041-GCrypto-coins-and-networks) |
| DurianPay DurianX (ID) | ✗ | ✗ | ✓ | ✗ | ✗ | Splash internal: v15 §7 |
| Yellow Card (Africa; PH, ID, TH bank sends) | ✗ | ✓ | ✓ (USDC per widget docs) | ✓ | ✗ | [Yellow Card widget](https://docs.yellowcard.engineering/v1.0.26/docs/supported-crypto-widget); [Yellow Card API](https://docs.yellowcard.engineering/reference/get-crypto-config.md) |
| Busha (Nigeria, Kenya), USDC | ✗ | ✓ | ✗ | ✓ | ✗ | [Busha](https://docs.busha.io/guides/reference/supported-currencies) |
| Kotani Pay (Africa) | ✗ | ✓ | ✓ | ✓ | ✗ | [Kotani Pay](https://developers.kotanipay.com/v3/api-reference/deposits/deposit-on-chain-supported-chains.md) |
| Fonbnk (PH, NG and others) | ✓ | ✓ | ✓ | ✓ | ✗ | [Fonbnk](https://docs.fonbnk.com/supported-countries-and-cryptocurrencies.md) |
| TransFi (B2B payouts) | ✓ | ✓ | ✓ | ✓ | ✗ | [TransFi](https://docs.transfi.com/docs/supported-crypto-currencies) |
| Tazapay (B2B) | ✓ | ✓ | ✓ | ✓ | ✗ | [Tazapay](https://developer.tazapay.com/collection-accounts/coverage/stablecoins.md) |
| Circle Payments Network | ✓ | ✓ | ✓ | ✓ | not checked | [Circle CPN](https://developers.circle.com/cpn/stablecoin-payments/references/supported-blockchains) |
| **Count** | **6** | **9** | **9** | **9** | **1** | |

### The Philippines: credible, but thinner than the slide implies

Coins.ph's status page has an "Arbitrum One Network Transfers" component at 100% availability over 90 days ([Statusfield](https://statusfield.com/services/coins-ph/arbitrum-one-network-transfers)), but it has the same kind of component for Sui, Base, Solana and Polygon ([Coins.ph status](https://status.coins.ph/)). PDAX posted "PDAX now supports USDC on ARB" on 1 December 2025, with no fees or minimums ([PDAX Learn](https://learn.pdax.ph/post/pdax-learn-usdc-on-arbitrum-is-now-on-pdaxZ)). A separate review of PDAX's USDC category page did not show that post ([PDAX](https://pdax.ph/learn/category/usdc/)), so confirm it directly.

GCash's GCrypto lists USDC on Ethereum, Avalanche and Base, PYUSD on Solana, and USDT on Ethereum, Avalanche, Tron, Celo, Kaia and TON. None of the three dollar tokens is listed on Arbitrum ([GCash Help Center](https://help.gcash.com/hc/en-us/articles/9781218166041-GCrypto-coins-and-networks)). Cebuana Lhuillier, the largest Philippine remittance network found, is building its stablecoin rail on Solana with Fireblocks ([Fintech News PH](https://fintechnews.ph/72356/blockchain/fireblocks-cebuana-lhuillier-stablecoin-philippines/)).

The B2B payout specialists that do take Arbitrum USDC are TransFi, Tazapay and Fonbnk. Fonbnk pays out to Philippine and Nigerian banks and accepts funds from them. Tazapay is both a candidate and a competitor. It raised US$36M in a round led by Circle Ventures ([Cointelegraph](https://cointelegraph.com/news/cross-border-payment-provider-tazapay-raises-36m-from-circle-coinbase)), and Circle is acquiring it for US$400M in stock, with closing expected in 2027 subject to approval by Singapore's MAS ([American Banker](https://www.americanbanker.com/payments/news/circle-expands-stablecoin-network-with-tazapay-acquisition)).

### Indonesia and Africa: Arbitrum reaches neither natively

Yellow Card is the one partner found with bank payouts in the Philippines, Indonesia, Thailand and Nigeria ([Yellow Card Asia](https://docs.yellowcard.engineering/docs/asia); [Yellow Card Africa](https://docs.yellowcard.engineering/docs/africa)). Its docs list USDC on Ethereum, Celo, Base, Stellar, Solana and Polygon, but not Arbitrum ([Yellow Card widget](https://docs.yellowcard.engineering/v1.0.26/docs/supported-crypto-widget)). Busha and Kotani Pay also omit Arbitrum. Flutterwave settles on Polygon and Tempo ([Techeconomy](https://techeconomy.ng/flutterwave-taps-tempo-to-deepen-stablecoin-infrastructure-in-africa-after-turnkey-deal)). An Arbitrum-only Splash would need a CCTP V2 hop before every African or Indonesian payout. The hop is cheap, but it adds a step and a way for the payment to fail.

### Why not Base or Polygon?

A VC will ask this. "Our Philippine partners settle on Arbitrum" does not answer it, because the same evidence supports Base and Polygon at least as well.

- **Base beats Arbitrum on reach alone.** It holds more stablecoins: US$5.19B, of which about US$4.34B is USDC ([DefiLlama Base](https://defillama.com/stablecoins/Base)). It has a newer EAS deployment built into the chain ([EAS contracts](https://raw.githubusercontent.com/ethereum-attestation-service/eas-contracts/master/README.md)). It reaches Coins.ph and GCash in the Philippines, and all three African off-ramps checked.
- **Polygon** holds US$2.95B of stablecoins ([DefiLlama Polygon](https://defillama.com/stablecoins/Polygon)) and has the longest PDAX history. It covers DurianPay for Indonesia, and Yellow Card and Kotani Pay for Africa.
- **Arbitrum's honest advantages lie elsewhere:** the Stage 1 rating, the institutional and real-world-asset story in the Foundation's report, and an audit programme and gas sponsorship that subsidise exactly what Splash must build. The narrative advantages are soft, and the Stage 1 advantage has a gap: Base's and Polygon's L2BEAT stages and 2026 fees were not checked, so Stage 1 counts as an advantage only until someone looks.

The answer that survives diligence (proposal):

> "We don't bet on one EVM chain. Our EVM rail is one set of contracts (Safe, router, EAS schemas) that deploys identically on Arbitrum, Base and Polygon. CCTP V2 moves native USDC to whichever chain the payout partner accepts. Arbitrum is first because the Philippine venues we target support it, it is a Stage 1 rollup, and its audit programme fits our build. Base comes next for GCash and Africa. Polygon is the hop to Indonesia. The record layer is on Sui either way."

The corollary is blunt. If by mid-October the only written confirmation you hold is for Base, deploy on Base first. The code is the same; only the chain ID changes.

## Kaia's portal teaches assembly, and Arbitrum is the easiest chain to assemble on

### What the Kaia portal actually is

The Kaia Portal is a legal and product pattern, not technology to copy. Its terms of service took effect on 29 August 2024 and are governed by Abu Dhabi law. They define each service as a third party's ([Kaia Portal ToS](https://portal-docs.kaia.io/terms/terms-of-service.md)):

- **Swap** is "available through Third Party Services, 1inch and Swapscanner".
- **Bridge** is "facilitated through the Third Party Service Providers, Stargate and Wormhole".
- **Buy** is a fiat purchase through an unnamed third party.

Users connect their own wallets and sign every transaction, and the Kaia DLT Foundation cannot recover their keys. The only eligibility control is a sanctions clause; the terms describe no KYC, no transaction screening and no fees. The live page is a JavaScript app that could not be rendered, so the "Powered by SwapScanner" label itself was not seen.

SwapScanner is a single-chain DEX aggregator that "aggregates every single DEX on Kaia network", 17 of them. It charges "30% of the amount saved through Swapscanner", capped at 0.875% of the trade, or a flat 0.3% when no price comparison exists ([SwapScanner docs](https://docs.swapscanner.io/service/swap.md)). Its B2B Quote API powers swaps inside Korean wallets such as Klip and Kaikas ([SwapScanner history](https://docs.swapscanner.io/roadmap-and-history/update-history.md)). DefiLlama puts its TVL at about US$3.02M, all on Kaia ([DefiLlama](https://defillama.com/protocol/swapscanner)). It does not bridge, and it supports none of the chains Splash uses. Even Kaia's reference to 1inch looks stale: 1inch's Classic Swap API lists 18 chains, Arbitrum among them, and Kaia is not one ([1inch](https://business.1inch.com/portal/documentation/apis/swap/classic-swap/introduction)).

### Four lessons transfer

1. **The shell is the product.** Own the user experience and the legal wrapper, name every provider in the terms, and let the user sign. That keeps Splash off the custody and transmission side of the swap.
2. **Fragmentation is the cost to avoid.** Kaia's bridging guide tells users to "bring in assets based on the Stargate bridge" if they want to use a Stargate pool ([Kaia Portal docs](https://portal-docs.kaia.io/english/bridging-from-another-chain-to-kaia)). That is the wrapped-asset mess Splash must refuse. On Arbitrum it means native USDC only, never USDC.e or other bridged variants.
3. **A sanctions clause is not compliance.** A B2B settlement app must screen both addresses before it builds a transaction.
4. **Points programmes do not fit.** The portal's Missions points scheme is a tool for attracting liquidity, and it does not suit a B2B product that sits close to regulated activity.

One competitive signal matters more than any of these lessons. Kaia and LINE plan a stablecoin super-app supporting PHP and MYR stablecoins, with on- and off-ramps ([Decrypt](https://decrypt.co/340605/kaia-line-asia-universally-compliant-stablecoin-super-app?amp=1)). Kaia also says it wants to reduce dollar intermediation in Asian corridors ([Fintech News HK](https://fintechnews.hk/38186/fintechkorea/kaia-won-stablecoin-launch-2027/)). That runs against Splash's dollar-first thesis in the same corridor. For now these are plans, not products.

### Swap and bridge options on Arbitrum

Arbitrum is the easiest of Splash's three chains to assemble this layer on.

| Option on Arbitrum | Cost | Own screening documented | Note |
|---|---|---|---|
| Circle CCTP V2, direct | Burn and mint; Fast Transfer fee levels not fetched | Not applicable | Best for USDC→USDC; no bridged-token risk ([Circle](https://developers.circle.com/cctp/cctp-supported-blockchains)) |
| Mayan (Swift, MCTP, Fast MCTP) | Swift has no protocol fee; MCTP charges 0 bps when the output is USDC; Fast MCTP 3 bps ([Mayan](https://docs.mayan.finance/architecture/mctp.md)) | Chainalysis and Hermod blocklists ([Mayan](https://docs.mayan.finance/resources/compliance.md)) | Swift is the only verified route to Sui after 1 Dec if V2 misses |
| Across | LP fee plus relayer fee; optional `appFee` ([Across](https://docs.across.to/reference/fees-in-the-system)) | Not documented | 22 chains ([Across](https://docs.across.to/reference/supported-chains)) |
| Socket/Bungee | API free; "does not charge any additional fees" ([Socket](https://docs.socket.tech/about/fees-monetization.md)) | Not documented | About US$3.3M drained through unlimited approvals, Jan 2024 ([Blockworks](https://www.blockworks.com/news/socket-bridge-protocol-exploit)) |
| deBridge DLN | 4 bps plus 0.001 ETH ([deBridge](https://docs.debridge.com/dln-details/overview/fees-supported-chains.md)) | Not documented | |
| Odos | About 0.05% on stable pairs (Odos's estimate); keeps 20% of partner fees ([Odos](https://docs.odos.xyz/build/fees)) | Not documented | |
| 0x | US$1,000/month plan plus 0.15% on select pairs ([0x](https://0x.org/pricing)) | Not documented | Expensive for an app charging no swap fee |
| Squid | Splits integrator fees 50/50 ([Squid](https://docs.squidrouter.com/api-and-sdk-integration/key-concepts/collect-fees.md)) | TRM Labs blacklist API ([Squid](https://docs.squidrouter.com/additional-resources/compliance-and-security.md)) | |
| LI.FI | 0.25% service fee ([LI.FI](https://docs.li.fi/faqs/fees-monetization)) | Not documented ([LI.FI](https://docs.li.fi/introduction/learn-more/security-and-audits)) | Widget can lock the destination with `toAddress` ([LI.FI](https://docs.li.fi/widget/configure-widget)) |

One rule matters more than the choice of vendor. Three aggregator exploits in 2024–2026 drained users who had granted unlimited token approvals to a router contract with an arbitrary-call bug:

- Socket, January 2024, about US$3.3M ([Blockworks](https://www.blockworks.com/news/socket-bridge-protocol-exploit));
- LI.FI, July 2024, about US$9M ([The Block](https://www.theblock.co/amp/post/305666/li-fi-loses-estimated-9-million-in-exploit));
- the third-party SwapNet contract behind Matcha, January 2026, US$13.43M ([The Block](https://www.theblock.co/post/386986/matcha-meta-swapnet-incident)).

Splash should only ever ask users for exact-amount or one-time approvals.

The recommended standard (proposal), with Splash's integrator fee at zero:

- CCTP V2 or Mayan for USDC between chains, with Mayan Swift as the fallback to Sui;
- Socket/Bungee or Odos for same-chain swaps into native USDC;
- LI.FI only where its destination-locked widget saves real engineering work;
- the destination always taken from the user's own connected wallet and checked on Splash's server;
- Splash's own screening on both addresses, because most of these providers document none.

## Onramper's FPX support is real on a country page and thin everywhere else

### What the seven Onramper pages say

Onramper is a subscription-priced aggregator of other companies' ramps, not a ramp itself.

| Page | What it says | What it means for Splash on Arbitrum |
|---|---|---|
| Pricing | Essentials US$199/month with 6 onramps. Premium US$599/month (US$5,750/year) with all 30+ onramps, off-ramp, P2P, swap and "custom fees". White-Label at custom prices. Custom routing +US$400/month ([Onramper pricing](https://onramper.com/pricing)) | Off-ramp and any integrator fee need Premium. Essentials' US$1,800/year price "saves 16%" by the page's claim but about 25% by its own arithmetic |
| Coverage | "175+ payment methods", "30+ onramps"; the table did not render ([Onramper coverage](https://onramper.com/coverage)) | No mapping from payment method to provider |
| Crypto asset support | The list loads in an embedded frame that returned nothing ([Onramper crypto assets](https://docs.onramper.com/docs/crypto-asset-support)) | USDC on Arbitrum is unconfirmed on Onramper's own tables. Sui's docs list Onramper for the SUI token only ([Sui docs](https://docs.sui.io/onchain-finance/asset-custody/fiat-on-ramps)) |
| Enterprise | "30+ fiat-crypto providers", "1500+ cryptocurrencies", "Re-usable KYC", "generally does not add a fee"; no SLA figures ([Onramper enterprise](https://onramper.com/enterprise)) | The "licenses" claim describes the providers, not Onramper |
| Swap | A white-label of Exodus's XOSwap, "50+ networks", with an integrator markup ([Onramper swap](https://onramper.com/products/swap)). XOSwap lists Arbitrum and Solana, not Sui ([Exodus](https://docs.exodus.com/xoswap/v4/supported-networks)) | Works on Arbitrum; keep the markup at zero |
| Headless Ramps | The marketing says "without iframes or redirects" ([Onramper headless](https://onramper.com/products/headless-ramps)). The API docs end by redirecting the user to a URL ([Onramper API](https://docs.onramper.com/docs/integration-steps-1.md)) | KYC and payment stay on the provider's page |
| Off-ramp | "8 offramps integrated", paying out to cards, PayPal and bank accounts ([Onramper offramp](https://onramper.com/products/offramp)). The docs list 7 providers, and Onramp Money's flow supports Arbitrum and Solana but not Sui ([Onramper offramp flows](https://docs.onramper.com/docs/offramp-process-flow)) | A retail product: the provider pays "the user", not a supplier |

### The FPX claim

Onramper's Malaysia page lists FPX and DuitNow among 14 payment methods and names 11 providers. It never says which provider takes which method, for which assets or networks, or at what price ([Onramper Malaysia](https://onramper.com/country-coverage/the-best-crypto-onramps-for-malaysia)).

The only listed provider whose own site claims FPX for crypto purchases is TransFi. Its MYR page names "FPX, DuitNow QR, and Malaysian online banking" but gives no networks, no fees and no Malaysian licence ([TransFi MYR](https://www.transfi.com/buy-crypto/myr-to-tether)). Its FPX page gives a Dubai address and "Pricing: Custom" ([TransFi FPX](https://www.transfi.com/payment-methods/accept-fpx)). TransFi does support USDC on Arbitrum ([TransFi](https://docs.transfi.com/docs/supported-crypto-currencies)), so buying Arbitrum USDC with FPX through TransFi is plausible, but unverified.

The bigger problem is licensing.

- None of the 11 providers appears on the SC's register of digital asset exchanges. As of 20 July 2026 the register listed HATA Digital, Luno Malaysia, MX Global, SINEGY DAX and Kinetic DAX ([SC](https://www.sc.com.my/regulation/guidelines/recognizedmarkets/list-of-registered-digital-asset-exchanges)).
- Binance P2P is on Onramper's Malaysia list ([Onramper Malaysia](https://onramper.com/country-coverage/the-best-crypto-onramps-for-malaysia)), although the SC found in 2021 that Binance was "operating a digital asset exchange (DAX) illegally in Malaysia" ([Malay Mail](https://www.malaymail.com/news/money/2021/07/30/securities-commission-takes-enforcement-actions-against-binance-for-illegal/1993945)).
- Malaysia is also where Splash's own regulatory exposure sits. The anti-money-laundering law (AMLA) covers "providers of intermediation… relating to the offer or sale of digital currencies" ([Rajah & Tann](https://www.rajahtannasia.com/media/4734/2022_02_extension-partiv-amla.pdf)), and the SC has restricted advertising by unregistered exchanges since April 2026 ([The Edge](https://theedgemalaysia.com/node/804271)).

FPX through Onramper is therefore a convenience for consumer top-ups, and it carries regulatory baggage; it is not a B2B funding rail. Local methods matter more for the Philippines, where GCash, PayMaya and QR Ph appear among 12 providers, and for Indonesia, where QRIS, DANA, OVO and GoPay appear among 15 ([Onramper PH](https://onramper.com/country-coverage/the-best-crypto-onramps-for-the-philippines); [Onramper ID](https://onramper.com/country-coverage/the-best-crypto-onramps-for-indonesia)). The same mapping and licensing gaps apply in both countries.

### Terms, economics and how to use it

The terms remove Onramper from any responsibility for the transaction. Onramper Technologies B.V. calls itself "a provider of technical infrastructure" that is "not party to any transactions". It gives no warranties, and it provides no support for transactions, "including…refunds" ([Onramper T&C](https://onramper.com/terms-conditions-checkout)). The same terms bar partners from collecting, storing or processing "any user-inputted data" sent to the providers. That suits Splash's rule against holding personal data, and it also means Splash cannot reuse the provider's KYC.

The headless Checkout V2 flow fits Splash's server design. The server signs the request with an Ed25519 key and sends a hash of the user's IP address. In return it gets a session that is single-use, expires after 10 minutes, and fails if the IP address does not match ([Onramper Checkout V2](https://docs.onramper.com/docs/checkout-v2.md)).

Money and licensing raise three further points:

- Integrator fees are paid out monthly above a US$500 threshold ([Onramper KB](https://knowledge.onramper.com/can-i-add-a-fee-on-my-users-transactions)).
- The docs FAQ contradicts the "no added fee" line: it says Onramper adds no fees "for clients who process over EUR 100,000 in monthly volumes", which implies it may add them below that ([Onramper FAQ](https://docs.onramper.com/docs/faq)).
- No licence or registration for Onramper itself was found. One opinion piece describes it as operating under a "software provider exemption" ([FinTelegram](https://fintelegram.com/behind-the-gateway-why-ramp-network-embraces-mica-while-onramper-operates-in-the-aggregator-loophole)).

For a pre-revenue Splash, this means paying US$599 a month to unlock an off-ramp that cannot pay a supplier, with no remedy if a provider loses a customer's money. If you need consumer top-ups at all:

- take the cheaper plan;
- restrict providers with `onlyOnramps`, since Onramper documents no exclude parameter;
- pin the network with `onlyCryptoNetworks=arbitrum`;
- lock the destination with signed `networkWallets` ([Onramper widget parameters](https://docs.onramper.com/docs/supported-widget-parameters.md));
- take no fee until counsel signs off.

### The alternatives

Alchemy's "59 Onramper alternatives (2026)" page loads its list by JavaScript and could not be read ([Alchemy](https://www.alchemy.com/dapps/alternatives/onramper?size=100)). Alchemy's Onramper page names Coinbase Pay, Stripe Crypto Onramp, El Dorado and Monerium as alternatives, and lists Meld among tools "frequently used with" Onramper ([Alchemy Onramper page](https://www.alchemy.com/dapps/onramper)). The providers that matter for Arbitrum fall into two groups: consumer ramps and B2B payout partners.

| Provider | USDC on Arbitrum | Southeast Asian local methods verified | Pays a third party? | Note |
|---|---|---|---|---|
| Transak | ✓ ([Transak API](https://api.transak.com/api/v2/currencies/crypto-currencies)) | Philippines: card and Google Pay only ([Transak fiat API](https://api.transak.com/api/v2/currencies/fiat-currencies)) | Off-ramp pays debit cards, SEPA and UK Faster Payments ([Transak](https://docs.transak.com/docs/transak-off-ramp)) | |
| Ramp Network | ✓, minimum 6 USDC; bridged USDC.e also listed ([Ramp API](https://api.ramp.network/api/host-api/v3/assets)) | None seen | Purchase data only | Refuse USDC.e |
| Banxa | Buy and sell ✓ ([Banxa](https://docs.banxa.com/products/hosted-checkout/docs/reference/supported-cryptocurrencies-and-blockchains.md)) | Cards only in SEA; none in Malaysia | Pays out only in the EU, Australia, UK, Canada and US ([Banxa](https://docs.banxa.com/products/hosted-checkout/docs/reference/supported-payment-methods.md)) | |
| Onramp.money | Network listed ([Onramp.money](https://onramp.money/)) | GCash, Maya, InstaPay, DANA, GoPay, VietQR, Thai QR shown | Not stated | Which methods work on which chain is unverified |
| Alchemy Pay | ✓ per Circle's directory ([Circle partners](https://partners.circle.com/partner/alchemy-pay)) | Coverage tables unreadable | The user's own bank | Its Indonesian licence is a central-bank payments licence held through a partner, not an OJK licence ([Fintech News SG](https://fintechnews.sg/70094/crypto/fiat-crypto-gateway-alchemy-pay-gets-licenses-from-bank-indonesia/)) |
| Coinbase Onramp | Not checked | Not checked | The user's own linked bank; documented examples are US and Canada only | 2.5% card, 0.5% ACH ([Coinbase](https://docs.cdp.coinbase.com/onramp/additional-resources/faq.md)) |
| Fonbnk | ✓ | Philippine and Nigerian banks, both directions | Lists "Payouts (merchant USD balance to local currency)" ([Fonbnk](https://docs.fonbnk.com/supported-countries-and-cryptocurrencies.md)) | |
| TransFi | ✓ (USDCARB) | GCash, BDO, BNI, Mandiri listed ([TransFi](https://www.transfi.com/)) | "Pay suppliers and contractors globally" | No licence shown on its homepage |
| Tazapay | ✓ for collections | Payout coverage served by an API that could not be read | B2B | Circle acquisition pending |
| Triple-A | Networks unverified | Not checked | "Pay travel partners, agents and suppliers" ([Triple-A](https://www.triple-a.io/)) | Licensed by MAS as a Major Payment Institution |
| Yellow Card | ✗ | Bank payouts in PH, ID, TH and Nigeria | B2B API | Not on Arbitrum |
| Meld (aggregator) | Not checked | "54 local payment methods" ([Meld](https://www.meld.io/)) | Not checked | Terms not public; raised US$7M in Jan 2026 ([Fortune](https://www.fortune.com/2026/01/14/meld-raises-7-million-to-integrate-stablecoin-networks)) |

None of the global ramp providers checked appears on Malaysia's SC register, the BSP's VASP list or OJK's whitelist of 29 platforms ([SC](https://www.sc.com.my/regulation/guidelines/recognizedmarkets/list-of-registered-digital-asset-exchanges); [BitPinas](https://bitpinas.com/feature/list-licensed-virtual-currency-exchanges-philippines/); [Yahoo Finance](https://finance.yahoo.com/news/indonesia-ojk-whitelists-29-licensed-151241668.html)).

The structural conclusion is the same on every chain. Consumer ramps pay out to the seller's own card or bank, so they cannot pay a supplier. B2B payouts need direct integration with a payout partner. On Arbitrum those partners are TransFi, Tazapay and Fonbnk, plus whichever Philippine venue confirms it accepts Arbitrum USDC. For ramp coverage, Arbitrum ranks second of the three chains after Solana. It is far ahead of Sui, where no provider with a verified Southeast Asian local payment method sells or buys back USDC.

## Walrus stays, and its control plane never leaves Sui

### Writing and paying from an Arbitrum backend

Walrus can be Splash's single evidence store for Arbitrum payments, and it should be. The write path is plain HTTP: `PUT $PUBLISHER/v1/blobs`, with `epochs`, `permanent` and `send_object_to` parameters ([Walrus Web API](https://docs.wal.app/usage/web-api.html)). But every write is still a Sui transaction flow, paid in WAL for storage and in SUI for gas, and "Walrus has no public unauthenticated publisher on Mainnet. There are no plans to create one" (same source). The reason given is that "a publisher consumes both SUI and WAL on the service side" ([Walrus Network Reference](https://docs.wal.app/docs/network-reference)).

The Arbitrum rail therefore needs a publisher that Splash runs and authenticates. The flow works like this ([Walrus authenticated publisher](https://docs.wal.app/operator-guide/auth-publisher.html)):

1. Splash's backend checks the user.
2. It issues a one-use token (a JWT) with `max_size`, `max_epochs`, `exp` and `jti`.
3. The publisher, funded from a Splash Sui wallet, stores the blob.
4. It sends the resulting Blob object to a Sui address that Splash controls.

Always write through a publisher or upload relay from server code, because a direct SDK write takes about 2,200 requests ([Mysten SDK](https://sdk.mystenlabs.com/walrus.md)). End users never touch SUI or WAL. The WAL and SUI Splash holds are its own operating treasury, not customer money. Counsel should still confirm that holding them does not disturb the non-custodial position.

Mysten's own guidance for EVM users takes the same shape. Its Walrus Memory docs say "an Ethereum address cannot own a memory account" and tell developers to "model the mapping in your own application" ([Walrus Memory](https://docs.wal.app/walrus-memory/guides/agent-runtimes.md)). No production integration of Walrus with an EVM application was found. Allium's indexing of Arbitrum data into Walrus is data storage, not an application integration ([MEXC](https://www.mexc.com/news/958269)). The closest precedent is Blockticity, which stores certificates of origin and trade records on Walrus with a "multi-chain verifier" ([Walrus blog](https://blog.walrus.xyz/blockticity-brings-7b-in-authenticated-trade-records-to-walrus-verifiable-data-platform/)). Its anchoring chains are not named, but it is worth contacting.

### Cost, retention and lifecycle

Since 13 May 2026, Walrus has priced storage at **US$0.023 per GB per month of encoded size**, paid in WAL ([Walrus blog](https://blog.walrus.xyz/announcing-predictable-pricing-in-usd-on-walrus/)). Encoded size is 4.5 times the raw size plus 64 MB per blob ([Walrus costs](https://docs.wal.app/dev-guide/costs.html)), so a small evidence file stored on its own costs about US$0.0015 a month (my calculation).

Quilts batch up to 666 files into one blob ([Walrus Quilt](https://docs.wal.app/docs/system-overview/quilt)). The saving depends on file size: 409× for 10 KiB files, 190× for 50 KiB and 13× for 1 MiB. Typical PDF evidence therefore saves roughly 13–100×, not "400×". Take an illustrative 1,000 settlements a month with 300 KB of encrypted evidence each. Stored as daily quilts, each month's evidence costs about **US$6.30 over seven years**; stored as individual blobs, about US$126 (my calculation).

Three lifecycle facts matter more than the price:

- Blobs are "deletable by default" ([Walrus Web API](https://docs.wal.app/usage/web-api.html)).
- Mainnet epochs last two weeks, and a blob can be paid for at most 53 epochs ahead, about two years ([Walrus Network Reference](https://docs.wal.app/docs/network-reference)).
- "Anyone can extend shared blobs" ([Walrus: managing blobs](https://docs.wal.app/docs/walrus-client/managing-blobs.md)).

Splash's code today writes invoices with `epochs: 5` and no renewal, which is about ten weeks on mainnet (Splash internal: `v10-product-engineering-memo.md`). Evidence must instead be written with `permanent=true` at the maximum number of epochs, with a renewal job and as shared blobs, so that a successor or an auditor can keep it alive. An anchor on Arbitrum does not keep a blob alive; if the epochs lapse, the anchor points at nothing.

For comparison, Arweave costs about US$54 per GiB, paid once for permanent storage, against about US$9.50 per GiB for seven years on Walrus ([Arweave](https://arweave.net/price/1073741824); my calculation). Arweave's permanence is also a liability under erasure rules. Walrus wins on programmable disclosure and on a lifecycle that can be verified on-chain.

### Seal needs a Sui identity, and the Arbitrum Safe has none

Seal is the harder dependency. Access is decided by a `seal_approve` function written in Move on Sui ([Sui docs: Seal](https://docs.sui.io/sui-stack/seal)), and the person requesting decryption proves who they are with a session key signed by a Sui address ([Sui docs: Seal design](https://docs.sui.io/sui-stack/seal/design)). An Arbitrum Safe owner is not a Sui address. Splash has three options.

| Option | How it works | Assessment |
|---|---|---|
| A: operator decrypts (today's code) | Decryption runs through `getOperatorKeypair()`. The on-chain policy can only tell the operator from everyone else; real access control sits in a backend allowlist (Splash internal: v10 memo) | Amounts to "trust Splash". Acceptable for a pilot, too weak for the moat claim |
| B: Sui identity per party | Each counterparty and auditor gets a Sui identity through zkLogin or Enoki, mapped to the Arbitrum business in Postgres. Seal's docs support an `EnokiSigner`, and Walrus Console already signs users in with Google through zkLogin before encrypting with Seal ([Sui docs: using Seal](https://docs.sui.io/sui-stack/seal/using-seal); [Walrus Console](https://docs.wal.app/docs/console/overview.md)) | Documented and supported. **Choose this now** |
| C: verify Ethereum signatures on Sui | A `seal_approve` verifies an Ethereum signature with Sui's `secp256k1_ecrecover` and the Keccak-256 flag ([Sui framework](https://docs.sui.io/references/framework/sui_sui/ecdsa_k1)) | The building blocks exist, but Mysten documents no such pattern. Research only |

Run Seal on the 5-of-8 MPC committee that has been live on mainnet since 18 June 2026 ([Ruby Nodes](https://rubynodes.io/news/article/2/seal-mpc-mainnet)), or on independent key servers from different operators, under written agreements. Prices are not published ([Sui docs: Seal pricing](https://docs.sui.io/sui-stack/seal/pricing)). Seal's own docs carry two warnings: revoking access "cannot take back keys a user already fetched" ([Seal best practices](https://docs.sui.io/sui-stack/seal/security-best-practices)), and users should not store "regulated personal data" with it ([Sui docs: Seal](https://docs.sui.io/sui-stack/seal)).

### Anchoring from Arbitrum and keeping personal data off Walrus

The anchoring design (proposal) has two layers.

1. **Per settlement:** the router's `PaymentReference` event links each transfer to its evidence leaf in the same transaction.
2. **Per period:** an EAS attestation on Arbitrum carries that period's Merkle root. The same root is anchored on Sui, through the `RetentionCommitment` object and an authenticated event, and on Solana through the Solana Attestation Service ([Solana docs](https://solana.com/docs/tools/attestations.md)).

Each leaf should commit to the chain ID, the settlement ID, the Walrus blob ID and the quilt patch's stable identifier, a salted hash of the plaintext, a hash of the ciphertext, and the retain-until date. Anchoring one root on all three chains gives redundancy: if Sui halts, the Arbitrum anchor still proves the evidence existed at that time.

An auditor can then verify a payment from the document alone, in seven steps:

1. Recompute the salted hash of the document.
2. Check the Merkle proof against the root anchored on the settlement's chain.
3. Fetch the ciphertext from any Walrus aggregator.
4. Re-encode it locally to confirm the blob ID ([Walrus: verifying availability](https://docs.wal.app/docs/walrus-client/verifying-availability.md)).
5. Check that the blob is certified, unexpired and not deletable.
6. Decrypt through Seal under the auditor's own Sui identity.
7. Confirm the plaintext hash matches.

Privacy law sets the outer limit. Walrus states that "all data stored on Walrus is public" and that "blob IDs are not secrets" ([Walrus data security](https://docs.wal.app/docs/data-security.md)). Deleting a blob does not remove copies from caches or past storage nodes ([Walrus: managing blobs](https://docs.wal.app/docs/walrus-client/managing-blobs.md)). The relevant laws are:

- **Malaysia:** the PDPA requires data to be destroyed or permanently deleted once it is no longer needed ([Chambers Malaysia](https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/malaysia)).
- **Philippines:** data subjects can order "blocking, removal, or destruction", with exceptions for legal obligations ([NDV Law](https://ndvlaw.com/can-philippine-consumers-demand-permanent-data-deletion/)).
- **Indonesia:** data subjects have deletion rights ([Chambers Indonesia](https://practiceguides.chambers.com/practice-guides/data-protection-privacy-2026/indonesia)). The implementing regulation, GR 33/2026, becomes mandatory on 16 January 2027 ([Rajah & Tann Asia](https://www.rajahtannasia.com/viewpoints/pdp-law-updates-the-pdp-implementing-regulation-is-out-and-it-clarifies-some-key-questions-under-indonesias-pdp-law/)).

So KYB documents, IDs, bank account numbers and any individual's personal data never go on Walrus, even encrypted. Only encrypted business evidence and salted commitments do. Erasure works by destroying the per-file encryption key and the salt, both held in Postgres. No regulator in the three countries has endorsed this key-destruction approach (crypto-shredding) as erasure, so record it in a data-protection impact assessment.

## The better plan: one record layer on Sui, one portable EVM rail

This is a proposal. It stays UNCONFIRMED until you trigger the next canon version, and every contract change needs Sebastian's confirmation.

### The architecture

It keeps every invariant canon already locks. The record layer stays on Sui: zkLogin identity, the Sui records, Walrus storage, Seal disclosure, and the anchored period roots. The Arbitrum rail adds three things:

- a Safe for each business, owned by its approvers' passkeys;
- a Solidity router that accepts only native USDC, pulls exact amounts, pays the venue's per-payment deposit address and Splash's fee address in one transaction, emits the invoice reference, and reverts on any leftover balance;
- EAS schemas for KYB status and period roots.

A Malaysia→Philippines payment runs in five steps:

1. Approvers sign one Safe transaction with their passkeys.
2. The router moves native USDC to the venue on Arbitrum.
3. Splash's indexer captures the event.
4. The encrypted evidence goes to Walrus through Splash's publisher.
5. The daily root is anchored on Arbitrum, Sui and Solana, and the venue pays out pesos.

An Indonesian payment adds a CCTP V2 hop to the per-payment DurianX deposit address on Polygon. Splash never holds a key that can move a customer's funds. It never installs a module in a customer's Safe. Its only power is to refuse to route a payment.

The same contracts deploy unchanged on Base when the GCash or Africa conditions are met. This design lets you say three things truthfully. Splash is not leaving Sui. Arbitrum is an additional delivery rail. And any Splash payment can be verified the same way, whichever chain it moved on.

### Fee model

The fee model does not change by chain. Any fee charged as a percentage of value stays subject to the counsel question on percentage versus flat pricing.

| Flow | Proposal (UNCONFIRMED) | Arbitrum note |
|---|---|---|
| Transfer between verified Splash businesses on the same rail, invoice-backed, within KYC-tier limits | **Free** | Splash pays gas through a paymaster: about US$0.003 for a bare transfer on 2 Oct; the cost of a Safe execution plus router event is not yet measured. ArbiFuel can cover early volume |
| Transfer to an outside address | B2B only, after proof of wallet ownership and screening; tier rate 0.25% / 0.10% / 0.07% plus a US$2–3 minimum | A Safe proves ownership with an EIP-1271 signature (Splash internal: defense book D8) |
| Exit to the user's own verified wallet on another chain | Bridge cost passed through at cost, plus **US$1 flat** | CCTP V2 or Mayan; Arbitrum→Sui took about 20 min under V1 |
| Local bank payout through a licensed venue | Venue cost passed through at cost and shown against the reference rate, plus about 0.10% with a US$2 minimum; honest all-in price **about 0.30–0.35% on US$2,000 and above** | Indonesia adds a CCTP V2 hop to Polygon |
| Funding with native USDC already on Arbitrum | Free | USDC.e refused |
| Funding from other chains or assets | The user pays the bridge or swap at cost; Splash's integrator fee is zero | Exact approvals only |
| Fiat on-ramp | The user pays the provider; no affiliate fee until counsel clears it | Onramper Premium (US$599/month) only when actually needed |
| Plans | Free / Business US$149 (US$99 for founding customers) / Pro US$499, as in D11 | Same on every rail |

A 0.10% all-in price is impossible on any fiat payout. A 0.33% price holds only if the venue charges about 0.20% or less and the ticket is about US$2,000 or more (my calculation from the D10 inputs). On these rates, a US$5,000 payout at the Advanced tier costs about US$15 all-in, against US$41 on Wise's MYR→PHP page (Splash internal: defense book D11). Revenue still comes mostly from plans: the freight-weighted case needs about 74 Pro-size forwarders to cover the US$57k monthly burn (same source). The pitch line holds on every chain: **"Transfers are free. We charge for proof."**

### Register items to add

These follow canon's numbering convention, with an `A-` prefix for Arbitrum. All are UNCONFIRMED.

| Item | Content |
|---|---|
| A-D1 | Solidity, not Stylus, for the payment core |
| A-D2 | Native USDC only; the router refuses USDC.e |
| A-D3 | No Splash module, guardian key or allowance in any customer Safe |
| K-A1 | Arbitrum has no zkLogin equivalent. Proposed answer: zkLogin identity on Sui plus passkey Safe owners, pending the one-passkey spike |
| K-A2 | Written confirmation from Philippine venues of native USDC on Arbitrum for B2B disbursement |
| K-A3 | Feature check of EAS version 0.26 on Arbitrum |
| K-A4 | Diligence answers on the sequencer, the Security Council and the operator's fee and filtering powers |
| K-A5 | Trigger for deploying on Base: a GCash route or a passed African diligence |

### Next steps

| When | Step | Owner and gate |
|---|---|---|
| By 7 Oct (Basecamp) | Present Arbitrum as an additional delivery rail under the Sui record layer, never as a move away from Sui. Replace "PH partners settle on Arbitrum/Polygon/Tron, no Sui" with "Coins.ph and PDAX support Arbitrum USDC transfers". Stop citing "$70B monthly" as evidence of payments. Name no unsigned partner. Rehearse the Base/Polygon answer | You |
| 7–14 Oct | Get written answers from each target Philippine venue: native USDC (not USDC.e) on Arbitrum and on Base; B2B or API disbursement for a foreign platform's payers; per-payment deposit addresses; fees and limits; the Travel Rule data they need. Choose the first EVM deployment by 14 Oct based on those answers | You; decision gate |
| By 15 Oct | Ten forwarder calls, aiming for three LOIs (K4) | You |
| By 17 Oct | Spike on Arbitrum's Sepolia testnet: a Safe with two passkey owners through the WebAuthn signer; a Solidity router with exact approval, `PaymentReference` event and residual check; a feature check of EAS version 0.26; a paymaster on EntryPoint v0.7 or v0.8; the one-passkey-two-chains test | Sebastian |
| October | Apply to the Arbitrum Audit Program (router, Safe configuration, EAS schemas) and to ArbiFuel | You |
| By 31 Oct | CCTP gate: Circle's written status on V2 for Sui; Mayan Swift tested between Arbitrum and Sui in both directions; a route-health check built; confirmation that the Philippine corridor on Arbitrum needs no Sui bridge | Sebastian; launch gate |
| Oct–Nov | One counsel memo covering K10, in-app swaps and on-ramp embedding, AMLA paragraph 26, the SEC's wallet-provider category, Indonesia's ban on cross-border provision, and flat versus percentage pricing. Add three Arbitrum questions: Splash running a paymaster or relayer, Splash deploying customers' Safes, and Splash acting as an EAS attester | Ethos plus local counsel |
| November | Walrus authenticated publisher in two regions, with Mysten's relay as fallback. Write evidence with `permanent=true` at the maximum number of epochs, with a renewal job replacing `epochs: 5`. Replace operator-keypair decryption with Seal Option B. Anchor the daily root on Sui, Solana and Arbitrum. Fix anchor defects M2, M5 and M6, and re-weight the K11 multisig | Sebastian; Move gate |
| By 1 Dec | No live route depends on CCTP V1 | Launch gate |
| December | African partner diligence only: Kenyan licence status after the 4 Nov deadline and Nigerian status. Deploy the same contracts on Base only if that diligence or a GCash route passes | You |
| By 31 Dec | First partner-confirmed Philippine payouts with BIR-ready evidence packs, on whichever rail the signed venue accepts | You and Sebastian |
| By 16 Jan 2027 | Data-sharing agreements meet Indonesia's GR 33/2026 before any KYC data flows to Indonesian partners | You |

## Conclusion

This stress test changes what Arbitrum is for. It is not a second home for Splash or a hedge against Sui. It is a way to take the riskiest leg, the bridge, out of the Philippine money path while the proof stays on Sui. That changes the chain question a VC will ask. The chain that carries the money should be whichever one the licensed payout venue accepts, chosen corridor by corridor and changeable without rewriting the product. The part that never moves is the evidence: the same Walrus blob, the same Seal policy and the same Merkle root, anchored on all three chains. A payment that can be verified the same way whether it moved on Sui, Solana or Arbitrum is a stronger form of "audit-grade evidence" than any single-chain build. None of the comparable companies in this research described one. It also turns Arbitrum's weakest numbers, six of eleven partners and no African reach, from a strategic problem into a deployment detail.

The better solution, in one line: keep the record layer on Sui; build one portable EVM rail with passkey-owned Safes and a router that holds nothing; put it on Arbitrum first only where a Philippine venue confirms native USDC in writing; keep Base ready for GCash and Africa; and charge for proof, payouts and verified exits, not for moving dollars.
