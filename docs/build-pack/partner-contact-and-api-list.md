# Splash: who to contact for API access and integration (3 Oct 2026)

Draft. None of these is a signed partner; do not name any externally. Order = priority.

## Payout partners (fiat edge)

| # | Partner | Use | How to get access | Ask in writing | Status |
|---|---|---|---|---|---|
| 1 | **Noah** (noah.com) | Off-ramp USDC → Malaysian business bank (lead); PH, ID | Sandbox is self-serve: business.sandbox.noah.com → Configuration → API. Production: contract, then "2–3 weeks"; Noah rep reaches out | Which licensed entity pays MYR/PHP/IDR, on which rail; third-party B2B payouts allowed?; Standard-model KYB by API with Splash as technology partner; Squads vault as SourceAddress; Travel Rule fields; fees and FX at US$5k/25k/100k; webhook signing; Sui/Arbitrum plans | First call: run `GET channels/sell?Country=MY` in sandbox |
| 2 | **Due** (due.readme.io, opendue.com) | Backup off-ramp: MYR DuitNow (RM1M), PHP InstaPay/PESONet, IDR BI-FAST; Arbitrum USDC | Sandbox at dev.sandbox.due.network; request API key from Due | Licences and regulated payout partner per country; business beneficiaries on DuitNow; IBG/RTGS above caps; Sumsub share-token setup and Due's client ID; Solana funding address; rate card; one master account vs one per business | Due diligence on licences first |
| 3 | **PDAX** (+ Toku) | PH: PHP to GCash, GrabPay, InstaPay, PESONet; USDC on Solana and Arbitrum | Business development / institutional desk | Per-payment deposit addresses; B2B disbursement API; fees; Travel Rule format | Locally licensed (BSP) |
| 4 | **Coins.ph** | PH payouts; USDC on Aptos, Arbitrum, Sui network listed | Business / merchant API team | Which tokens per network; business API cash-out; deposit address per payment | Candidate |
| 5 | **TransFi** | MYR collections (FPX, Boost) and MYR/PHP/IDR payouts; Solana USDC | Sales / docs.transfi.com | Licence list per entity; MYR payouts to business accounts over DuitNow/IBG with limits; prefund vs per-order address | Licence claims unverified |
| 6 | **Tazapay** | FPX corporate collection (to US$20k); payouts 100+ currencies; Solana/Arbitrum USDC | Sales; docs.tazapay.com | MYR/PHP/IDR payout rails; stablecoin payout chains; what changes under Circle (closing 2027) | MAS MPI; no MY licence |
| 7 | **Triple-A** | PH backup | Sales | MYR/IDR payouts; prefund on Solana/Arbitrum; July 2026 hack remediation | MAS MPI; hack flag |
| 8 | **DurianPay** | Indonesia | Existing contact | Rate card in writing; sandbox scope; which chains | Pilot planned |

## Ringgit on-ramp (business's own account)

| Partner | Ask |
|---|---|
| HATA Digital, Luno Malaysia, SINEGY, MX Global, Kinetic (SC-registered exchanges) | Corporate accounts; withdrawal of native USDC on Solana/Arbitrum/Sui; API; referral terms |

## Rails and infrastructure

| Provider | Use | Access | Ask |
|---|---|---|---|
| Circle | CCTP V2; status of Sui V2 | developers.circle.com; Circle partner team | **Written date for CCTP V2 on Sui** (V1 throttles 31 Oct, pauses 1 Dec) |
| Mayan | Cross-chain USDC (Swift, MCTP) | SDK, public; Discord/BD for limits | Swift capacity into/out of Sui; outage history |
| LI.FI | Multi-route quotes | portal.li.fi | Fee schedule for stablecoin pairs; share of integrator fees |
| Socket / Bungee | Multi-route quotes | docs.socket.tech; API key | Which provider serves Sui USDC |
| Sumsub | KYB + reusable KYC share tokens | sumsub.com sales | Business-verification price; share-token recipient setup for Due/Noah |
| KYT vendor (pay-per-check) | Wallet and transaction screening | Chainalysis, TRM, Elliptic or pay-per-check vendor | Lowest tier price |
| Enoki / Shinami | Sui gas sponsorship | Enoki portal; Shinami dashboard | Per-request fees; caps |
| Kora (Solana) | Fee relayer | Open source | Squads compatibility |
| Pimlico / Alchemy | Arbitrum paymaster | Dashboards | Gas markup (Alchemy 8%) |
| Walrus / Seal | Evidence storage and access | Run own publisher; Seal key servers (8 operators) | Key-server pricing; committee mode on mainnet |
| Anthropic | Zeke models | Console | Zero data retention; DPO/PDPA terms |

## Legal

| Who | Ask |
|---|---|
| Ethos / Malaysian counsel | Is a BNM-licensed party needed when a Malaysian business pays out through Noah/Due? MSBA remittance (K10); SC exchange perimeter for in-app swaps and on-ramps; percentage vs flat fees; USDC as foreign-currency asset |
| Philippine counsel | SEC CASP rules vs non-custodial software |
| Indonesian counsel | Foreign provision ban; BI "forwarding payment instructions" |
