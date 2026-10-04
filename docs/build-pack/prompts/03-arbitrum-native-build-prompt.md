# Splash v15 · Arbitrum native build prompt (Polygon as a delivery network)

**For:** Sebastian and his coding agent · **Date:** 4 Oct 2026 · **Start:** after the Colosseum submission (12 Oct) · **Target:** testnet demo by 31 Oct
**Canon:** `docs/build-pack/business-module-v15.md` and the master prompt `01-master-prompt-v15-sui.md` (§0 ground rules apply). Load `evm-arbitrum-payments-engineer`, `fintech-architect`, `fintech-security-compliance` and `agentic-finance-expert`. For UI, load `ui-ux-pro-max`, `isometric-typography-designer`, `frontend-design` and `design-taste-frontend`.

---

You are building the **Arbitrum-native** Splash build, one of the three settlement lanes (Sui, Solana, Arbitrum). **Polygon PoS is a delivery network only:** Noah and DurianPay list it, so CCTP V2 mints USDC from the Arbitrum balance straight to the partner's Polygon deposit address. There is no Safe and no Splash contract on Polygon. Supported coins and networks are whatever the payout partners and swap providers accept (the registry in `lib/partners/registry.ts`). Read this whole prompt first.

## 0. Why this build exists, and what it must not become

- Arbitrum serves the Philippine partner path: PDAX lists USDC on Arbitrum. Noah and DurianPay are reached by delivery to Polygon. Both are on **CCTP V2** (Arbitrum domain 3, Polygon PoS domain 7).
- **Noah does not list Arbitrum.** A Noah payout from an Arbitrum balance is a CCTP V2 burn on Arbitrum with `mintRecipient` = Noah's per-payment deposit address on Polygon, Base or Solana. The engine picks it from the registry; don't hard-code it.
- Public copy follows master §0 rule 4: "payout partner", never "licensed partner".
- **Must not become:** a custodial router, an upgradeable proxy anyone can change, or a Stylus contract (Stylus programs must be reactivated every 365 days; not worth it for this).
- `ENGINE_HOME_CHAIN=arbitrum`, `ENGINE_LANES=arbitrum`. Delivery networks (Polygon, Base, Solana) come from the registry.

## 1. Architecture

| Layer | Choice | Notes |
|---|---|---|
| Wallet | **Safe** smart account per org on Arbitrum only | Owners: admin **passkey** (Safe WebAuthn signer; P-256 verification uses RIP-7212, so verify it on Arbitrum Sepolia) and **recovery kit** EOA (secp256k1 at `m/44'/60'/0'/0/0`), threshold 1. Two-signature mode: admin + approver (a different KYB associate) + kit A + kit B (custodians who don't approve), threshold 2 (master §2 rules). **No modules except Safe4337Module, no guard** |
| Gas | ERC-4337: Safe4337Module + **Pimlico** bundler and verifying paymaster (Splash sponsors, per-org caps) | Business holds no ETH. Alchemy's paymaster adds ~8% gas markup; Pimlico first |
| Asset | Balance: native USDC on Arbitrum `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`; USDT0 only where a partner accepts it. Delivery reference: native USDC on Polygon `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` (minted to the partner, never held) | Verify every address against the issuer's docs before use |
| Invoice reference | USDC has no memo. **`SplashPayRouter` event** carrying the salted invoice commitment | See §2 |
| Cross-chain | **CCTP V2** (TokenMessengerV2 / MessageTransmitterV2, addresses from developers.circle.com), Fast Transfer when Fastest is chosen; LI.FI or Socket for quotes | Socket works here (EVM). Never assume a Sui route |
| Evidence anchor | **EAS** attestation of the batch Merkle root on Arbitrum One (verify the EAS address) + the same root on Sui (`splash_evidence`) | Schema `splash.evidence.root.v1` (same fields as SAS) |
| Evidence store | Walrus via Splash's publisher; Seal allowlist with each authorised person's reader address (a non-extractable device key mapped to Sui); never the Safe, never the kit | Same bundle format on every build |
| Agent | Zeke, the same six agents | — |

## 2. The one contract: `SplashPayRouter` (Solidity, Foundry)

**Purpose:** move a stablecoin from the payer's Safe to the recipient in the same call that records the payment reference, and refuse duplicates. It holds nothing and has no owner.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "openzeppelin/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin/token/ERC20/utils/SafeERC20.sol";

/// Holds no funds, has no owner, is not upgradeable. Arbitrum only.
contract SplashPayRouter {
    using SafeERC20 for IERC20;

    error AlreadyPaid();
    error ZeroAmount();
    error ZeroAddress();
    error TokenNotAllowed();

    address public immutable USDC;   // native USDC on this chain
    address public immutable USDT0;  // set to address(0) if not accepted

    /// payer => invoice commitment => paid
    mapping(address => mapping(bytes32 => bool)) public paid;

    event Paid(
        address indexed payer,
        address indexed to,
        address indexed token,
        uint256 amount,
        bytes32 invoiceCommitment, // deterministic per invoice; never the raw invoice number
        bytes32 quoteId
    );

    constructor(address usdc, address usdt0) {
        if (usdc == address(0)) revert ZeroAddress();
        USDC = usdc;
        USDT0 = usdt0;
    }

    function pay(address token, address to, uint256 amount, bytes32 invoiceCommitment, bytes32 quoteId) external {
        if (token != USDC && (USDT0 == address(0) || token != USDT0)) revert TokenNotAllowed();
        if (amount == 0) revert ZeroAmount();
        if (to == address(0)) revert ZeroAddress();
        if (paid[msg.sender][invoiceCommitment]) revert AlreadyPaid();
        paid[msg.sender][invoiceCommitment] = true;            // effects before the external call
        IERC20(token).safeTransferFrom(msg.sender, to, amount); // straight from payer to recipient
        emit Paid(msg.sender, to, token, amount, invoiceCommitment, quoteId);
    }
}
```

- **The invoice commitment must be deterministic, or the duplicate check is useless.** Use `invoiceCommitment = keccak256(abi.encode(orgCommitmentKey, supplierId, invoiceNumber))`. `orgCommitmentKey` is a per-org 32-byte secret stored encrypted server-side, so the same invoice always gives the same commitment. Never use a random salt per payment.
- **Receipt verification** checks four things: the `Paid` event comes from the deployed router address; `token` is the allowlisted USDC; `payer` is the org's Safe; and the amount matches the evidence bundle.

- **The Safe executes one MultiSend batch.** This is a Safe DELEGATECALL to the canonical `MultiSendCallOnly`, so the paymaster policy must decode the inner calls:
  1. `USDC.approve(router, amount)` (exact amount)
  2. `router.pay(...)`
  3. Optional: the Splash fee transfer to Splash's fee address, as a **separate, visible** transfer the business signs. It is the only value Splash ever receives, and it is Splash's own fee.
- **No** `delegatecall`, no `receive`/`fallback`, no admin, no pause, no proxy. Deploy deterministically (CREATE2) on Arbitrum only.
- **Tests (Foundry):**
  - unit tests for every revert
  - a fuzz test on amounts
  - **an invariant test: across any sequence of `pay` calls, `token.balanceOf(router)` never changes from 0.** Tokens sent to the router directly, outside `pay`, are stuck by design: there is no rescue function. Document it.
  - `TokenNotAllowed` for any other token; the duplicate check with the same commitment twice
  - a test that a fee-on-transfer or rebasing token cannot leave dust (the allowlist only admits USDC and USDT0, but test anyway)
  - a gas snapshot
- **Static analysis:** Slither clean, or every finding explained in the PR. Ask OtterSec or the Arbitrum Audit Program for a review before mainnet.

## 3. Build list with acceptance criteria

**3.1 App**
- Next.js (read `node_modules/next/dist/docs/` for this version first), viem + wagmi, `@safe-global/protocol-kit` and `relay-kit` (4337), `permissionless` (Pimlico), `@ethereum-attestation-service/eas-sdk`, `@mysten/walrus` + `@mysten/seal`.
- Pages: `/`, `/app/onboarding`, `/app/fund`, `/app/pay`, `/app/receipts/[id]`, `/docs` (short). Landing uses the master §4 copy system with the line "Settles on Arbitrum and Polygon. Proof kept on Walrus."
- **Acceptance:** [ ] build clean. [ ] a11y ≥ 95. [ ] 390 px.

**3.2 Recovery kit, passkey, Safe**
- The same kit screen and copy as master §2. The kit's EVM key signs a nonce as proof of possession.
- Passkey registration with WebAuthn, then Safe deployment (owners, threshold) on Arbitrum Sepolia.
- Mode switch is `addOwnerWithThreshold` / `removeOwner` / `changeThreshold` in one Safe transaction. It removes the admin-held kit A and adds custodian kits A and B made on the custodians' devices. Turning off two-signature mode needs threshold 2.
- **Acceptance:**
  - [ ] **Walk-away test, both modes:** with Splash's server off, open the Safe app (app.safe.global), connect the kit EOA (single), or kits A + B (two-signature), and move 1 test USDC; record the hashes.
  - [ ] A test that the Safe has no enabled module other than Safe4337Module and no guard.
  - [ ] The admin alone can't execute in dual mode (test).

**3.3 Gas sponsorship**
- Pimlico verifying paymaster with a policy that sponsors only UserOperations whose calls (including the calls **inside** a MultiSendCallOnly batch, decoded) target USDC, USDT0, `SplashPayRouter`, CCTP V2 TokenMessengerV2 and EAS. Per-org daily cap.
- **Acceptance:** [ ] A UserOperation calling any other target, directly or inside a batch, is not sponsored (test).

**3.4 Funding**
- Connect wallet (MetaMask, Rabby, Coinbase Wallet, Safe). Same-chain transfers go direct; cross-chain transfers use CCTP V2 or LI.FI/Socket quotes. The destination is locked to the org Safe. Approvals are exact-amount only.
- A Sui destination exists only via Mayan (routed from the shared engine), never via Socket.

**3.5 Route engine lane and delivery**
- The `arbitrum` lane in `packages/route-engine`, plus delivery to registry networks: `cctp-v2-evm.ts` (burn on Arbitrum, `mintRecipient` = the partner's deposit address on Polygon, Base or Solana; standard + Fast), `lifi.ts`, `socket.ts`.
- Registry (shared `lib/partners/registry.ts`): PDAX `arbitrum, solana`; Noah `polygon, base, solana, ethereum`; DurianPay `polygon`; all `signed: false`.
- **Acceptance:**
  - [ ] A fixture for a US$10,000 PHP payout from an Arbitrum balance, showing PDAX direct on Arbitrum against Noah via a CCTP V2 mint on Polygon, ranked under all three policies.
  - [ ] The home-lane test with `ENGINE_HOME_CHAIN=arbitrum`.

**3.6 Payout**
- The same partner interface as the other builds. The deposit address is per payment. Signed webhooks go into evidence. A mock partner is allowed on testnet, labelled.
- **Invariant:** the destination is the partner's per-payment deposit address or the business's own address.

**3.7 Evidence and EAS**
- The same bundle (kind 3) and the same Walrus/Seal path. The batch root is attested through EAS on Arbitrum Sepolia, plus Sui.
- The receipt page verifies the Merkle path, the EAS attestation, the router `Paid` event (router address, token, payer Safe, amount) and the Walrus blob.
- **Acceptance:** [ ] Tampering with any field fails verification (test).

**3.8 Zeke**
- The six agents; `eval:zeke` green before any demo.

## 4. Fees (identical on every build)

- Splash ↔ Splash: free (on Arbitrum, Splash sponsors the gas and recovers it through plans; never say "gasless").
- Outside wallet: the tier rate.
- Bank payout: partner and network at cost + 0.10% / 0.15% / 0.15% by policy, minimum US$2, all-in target ≤ 0.33% from US$2,000.

## 5. Open checks Sebastian must answer before coding §3.2

1. Safe WebAuthn signer version and whether RIP-7212 is live on Arbitrum Sepolia.
2. CCTP V2 contract addresses and Fast Transfer fees on Arbitrum and Polygon (Circle docs).
3. EAS contract address on Arbitrum One.
4. Native USDC and USDT0 addresses on Arbitrum, and native USDC on Polygon for delivery (issuer docs).
5. PDAX: does it accept business deposits from a Safe (contract) address on Arbitrum? Ask in writing.
