# Splash Finance

Splash Finance is a B2B cross-border settlement prototype for SEA exporters, marketplaces, and payroll operators. The app uses Next.js App Router, React Query, Tailwind CSS, server-driven settlement APIs, and Sui Move contracts.

## Features

- Landing page with Splash hero, trust rail, feature bento grid, batch payout preview, FPX simulation, and footer.
- Business dashboard with overview, transfer, batch payout, and KYB settings routes.
- Seven-step single-transfer wizard with quote, TOTP authorization, server status polling, and printable receipt.
- CSV batch payout flow with PapaParse and server-side batch authorization.
- KYB upload API that records encrypted-storage metadata, document SHA-256 hashes, and a KYB case ID.
- Separate staff admin console for KYB approvals, support replies, and complaint management.
- Move package with `splash_protocol::business_account` and `splash_protocol::settlement` modules.

## Environment

Create `.env.local` with:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPPORT_EMAIL=support@splash.finance

SUI_NETWORK=testnet
SUI_RPC_URL=
SPLASH_PACKAGE_ID=0x...
SPLASH_TREASURY_ID=0x...
USDC_TYPE=0x2::sui::SUI
ENOKI_API_KEY=
OPERATOR_SUI_ADDRESS=0x...

SUMSUB_APP_TOKEN=
SUMSUB_SECRET_KEY=
SUMSUB_LEVEL_NAME=splash-kyb
SUMSUB_BASE_URL=https://api.sumsub.com

ADMIN_EMAIL=staff@splash.finance
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

Use a real coin type for `USDC_TYPE` after publishing or selecting a testnet USDC-compatible coin. The default SUI type is useful for local/test transactions only.

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Move package validation:

```bash
sui move build
```

## Move publish flow

From the `move` directory:

```bash
sui move build
```

When you are ready to publish to testnet, run only after explicit confirmation:

```bash
sui client publish --gas-budget 100000000
```

After publishing:

1. Copy the published package ID into `SPLASH_PACKAGE_ID`.
2. Create or configure the operator treasury object for the settlement asset.
3. Copy the treasury object ID into `SPLASH_TREASURY_ID`.
4. Restart the Next.js dev server so server environment variables refresh.

## Important routes

- `/` landing page
- `/login`
- `/signup`
- `/forgot-password`
- `/dashboard`
- `/dashboard/transfer`
- `/dashboard/batch`
- `/dashboard/settings`
- `/settings/kyb`
- `/admin/login`
- `/admin`
- `/admin/kyb`
- `/admin/support`
- `/transfer/fpx`
- `/api/kyb/upload`
