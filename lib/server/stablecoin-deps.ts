import {
  buildTransferBytes,
  describeBuildError,
  digestOf,
  executeTransfer,
  explainGaslessRefusal,
  isTransientChainError,
  laneClient,
  readTransfer,
  senderOf,
  simulateTransfer,
} from '@/lib/server/stablecoin-chain';
import type { SendDeps } from '@/lib/server/stablecoin-send';
import { consumeStepUp, releaseStepUp } from '@/lib/server/step-up';

/**
 * The real dependencies for a wallet transfer: Postgres for the ledger, the
 * lane's own fullnode clients for the chain. Null without a database — the
 * allowance is a ledger, and a ledger that disappears on restart is not one.
 */
export async function liveSendDeps(): Promise<SendDeps | null> {
  if (!process.env.DATABASE_URL) return null;
  const [{ getDb }, { readRecipient }] = await Promise.all([
    import('@/lib/db/client'),
    import('@/lib/server/recipients-store'),
  ]);
  const db = getDb();
  return {
    db,
    approval: {
      consume: ({ orgId, subjectId, subject }) => consumeStepUp(db, { orgId, purpose: 'STABLECOIN_TRANSFER', subjectId, subject }),
      release: ({ orgId, subjectId }) => releaseStepUp(db, { orgId, purpose: 'STABLECOIN_TRANSFER', subjectId }),
    },
    readRecipient,
    feeAddress: () => process.env.SPLASH_FEE_ADDRESS_MAINNET,
    isSplashWallet: (address) => isSplashWallet(db, address),
    multisig: {
      bySender: async (address) => {
        const { orgWalletByAddress } = await import('@/lib/wallet/org-wallet');
        const wallet = await orgWalletByAddress(db, address);
        return wallet ? { members: wallet.members } : null;
      },
    },
    chain: {
      build: (input) => buildTransferBytes(laneClient(), input),
      simulate: (bytes) => simulateTransfer(laneClient(), bytes),
      execute: (bytes, signature) => executeTransfer(laneClient(), bytes, signature),
      read: (digest) => readTransfer(laneClient(), digest),
      digestOf,
      senderOf,
      describeBuildError,
      explainGaslessRefusal,
      isTransient: isTransientChainError,
    },
  };
}

/**
 * A Splash wallet is an organisation's multisig (org_wallets — active or
 * migrating, since a migrating wallet's funds still sit at its address), or
 * the Sui address of a Splash user's passkey — the main admin's, or
 * anyone's. A revoked passkey's address still counts: the money still
 * reaches a Splash user, who can restore the passkey.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function isSplashWallet(db: any, address: string): Promise<boolean> {
  const [{ passkeyCredentials, orgWallets }, { eq, and, inArray }] = await Promise.all([
    import('@/lib/db/schema'),
    import('drizzle-orm'),
  ]);
  const wallets = await db
    .select({ id: orgWallets.id })
    .from(orgWallets)
    .where(and(eq(orgWallets.address, address.toLowerCase()), inArray(orgWallets.status, ['active', 'migrating'])))
    .limit(1);
  if (wallets.length > 0) return true;
  const rows = await db
    .select({ id: passkeyCredentials.id })
    .from(passkeyCredentials)
    .where(eq(passkeyCredentials.suiAddress, address.toLowerCase()))
    .limit(1);
  return rows.length > 0;
}

export const NO_LEDGER_RESPONSE = {
  error: 'Wallet transfers need the database: the 30-day allowance is a ledger. Set DATABASE_URL.',
  code: 'ledger_unavailable',
};
