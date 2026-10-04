# Payout partner comparison (3 Oct 2026) — UNCONFIRMED research, no partner signed

| Provider | Sui | Solana | Arbitrum | MY / PH / ID bank payout | Third-party payout | Funds model | Licence fit |
|---|---|---|---|---|---|---|---|
| Noah | No | Yes | No (Base/Polygon yes) | MYR, PHP, IDR listed | Yes | Unique deposit address per payout; payer business can be Noah's own customer | US NMLS 2696057; local payout entity undisclosed |
| Triple-A | No | Yes (acceptance) | Yes (acceptance) | PHP named; MYR/IDR unconfirmed | Yes | Prefunded 24h ahead, USDC/USDT on Tron/Ethereum only | MAS MPI (DPT, cross-border transfer, acquiring), ACPR PI, US MSB; no MY/PH/ID licence; US$11.8M treasury hack Jul 2026 |
| Circle CPN | No | Yes | No | PH via Coins.ph; MY/ID not documented | Yes | Sender institution holds funds | Members must hold MTL/EMI-equivalent licences: Splash not eligible |
| Circle Tazapay | — | — | — | 100+ markets; MY/ID unverified | Yes | Tazapay holds funds | Deal closes 2027 (MAS approval) |
| BVNK | No | Yes | Yes | No (USD/EUR/GBP only; SWIFT USD) | Yes | Prefunded BVNK wallet | UK/Malta EMI, US MTLs; Mastercard deal pending |
| Transak | USDC listed | Yes | Yes | Sell to Visa card only (MY/PH); ID not listed | No (own account only) | Payer sends to Transak deposit address | NMLS 2362652, FinCEN/FINTRAC |
| Venly | No | Yes | Yes | No (links to MoonPay/Transak/Ramp) | No | Venly Pay balance, own-account withdrawal | Belgian company; licence unverified |
| Alchemy | gRPC RPC only | Yes | Yes | No fiat at all | — | — | Infra only; Wallet APIs + Privy for EVM/Solana gas sponsorship (8% fee) |
| Alchemy Pay (separate co.) | ? | ? | ? | ID via BI PJP Cat. 3 partner; PH/MY unverified | ? | ? | Needs direct check |
| PDAX (+Toku) | No | Yes | Yes | PHP to GCash, GrabPay, InstaPay, PESONet | Yes | Per-partner, check | BSP-licensed VASP |

Ranking for Splash: 1 Noah (single API for MY/PH/ID, per-payout address fits zero-balance; confirm local licensee). 2 PDAX for PH (licensed locally). 3 Triple-A as PH backup (prefund + hack are flags). Circle CPN later via a licensed member. BVNK/Transak/Venly/Alchemy are not payout rails for these corridors. None supports Sui: payout money moves on Solana.
