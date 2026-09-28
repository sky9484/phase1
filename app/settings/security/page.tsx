import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import PasskeyEnrolment from '@/components/auth/PasskeyEnrolment';
import WalletMembersCard from '@/components/settings/WalletMembersCard';
import { getCustomerSession } from '@/lib/server/customer-auth';

/**
 * Security settings — today, the approval signer.
 *
 * Enrolment only. There is deliberately no approval action here: the Move
 * entry point an approval would call does not exist yet, and a button that
 * signs something nothing can verify on chain would be theatre. The signer is
 * the prerequisite, and it is what this page sets up.
 */
export const dynamic = 'force-dynamic';

export default async function SecuritySettingsPage() {
  const session = await getCustomerSession();
  if (!session) redirect('/login');

  return (
    <main className="iso-settings">
      <Link href="/dashboard" className="iso-settings-back">
        <ArrowLeft aria-hidden="true" />
        Back to workspace
      </Link>

      <header className="iso-settings-head">
        <p className="iso-kicker">Security</p>
        <h1>Your approval signer</h1>
        <p>
          A payment leaves Splash when a named person releases it. This is the device that proves it was you: the key
          lives in your phone or laptop, never leaves it, and cannot be exported — so an approval is something only
          your device could have produced, rather than a record saying your name was on it.
        </p>
      </header>

      <section className="iso-settings-block">
        <PasskeyEnrolment />
      </section>

      <header className="iso-settings-head">
        <p className="iso-kicker">Wallet</p>
        <h2>The business wallet</h2>
        <p>
          Your business has one wallet on Sui, held by up to four of its own keys. A key that weighs 2 — the main
          admin&rsquo;s sign-in key or a backup passkey — signs a payment by itself. The weight-1 keys never can: a
          recovery contact you name at your business, and one Splash key kept offline that we only ever use in a
          recovery ceremony, together with your contact, to move the wallet to your new keys.
        </p>
      </header>

      <section className="iso-settings-block">
        <WalletMembersCard />
      </section>
    </main>
  );
}
