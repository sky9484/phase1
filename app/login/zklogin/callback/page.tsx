'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import SplashLoading from '@/components/SplashLoading';

/**
 * Where Google returns after a zkLogin sign-in.
 *
 * Google sends the id_token in the URL FRAGMENT, not the query string, so it
 * never reaches the server as part of the request line and never lands in an
 * access log or a Referer header. This page reads it client-side and POSTs it
 * to /api/auth/zklogin, which verifies it independently — the token is not
 * trusted because it arrived here, it is trusted because the server checked
 * its signature against Google's JWKS and recomputed the nonce.
 *
 * The pending ephemeral material is read back from sessionStorage and cleared
 * immediately, whatever the outcome. On success it graduates into
 * `splash.zklogin.signer` together with this epoch's proof (v15 §4): the
 * sign-in key IS a wallet member now, so the browser keeps exactly one
 * session-scoped signer, useless past maxEpoch and never paired with the JWT,
 * which is not stored.
 */
export default function ZkLoginCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const jwt = fragment.get('id_token');
      const oauthError = fragment.get('error');

      // Whatever happens next, the fragment does not stay in history.
      window.history.replaceState(null, '', window.location.pathname);

      const pendingRaw = sessionStorage.getItem('splash.zklogin.pending');
      sessionStorage.removeItem('splash.zklogin.pending');
      // A signer cached by an EARLIER session must not survive into this
      // sign-in attempt, whatever its outcome.
      sessionStorage.removeItem('splash.zklogin.signer');

      if (oauthError) {
        if (!cancelled) setError('Google sign-in was cancelled.');
        return;
      }
      if (!jwt || !pendingRaw) {
        if (!cancelled) setError('This sign-in link is incomplete. Start again from the login page.');
        return;
      }

      let pending: { maxEpoch: number; randomness: string; ephemeralPublicKey: string; ephemeralSecret?: string };
      try {
        pending = JSON.parse(pendingRaw) as typeof pending;
      } catch {
        if (!cancelled) setError('This sign-in could not be completed. Start again from the login page.');
        return;
      }

      try {
        const res = await fetch('/api/auth/zklogin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jwt,
            provider: 'google',
            ephemeralPublicKey: pending.ephemeralPublicKey,
            maxEpoch: pending.maxEpoch,
            randomness: pending.randomness,
          }),
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          if (!cancelled) setError(body.error ?? 'Sign-in could not be verified.');
          return;
        }

        // The sign-in key doubles as a wallet member (v15 §4): fetch this
        // epoch's proof now, while the token is still in hand, and cache the
        // signer for the send screen. Best-effort — a prover hiccup must not
        // cost the sign-in, and the backup passkey still signs. The JWT
        // itself is never stored.
        if (pending.ephemeralSecret) {
          try {
            const prove = await fetch('/api/auth/zklogin/prove', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jwt,
                ephemeralPublicKey: pending.ephemeralPublicKey,
                maxEpoch: pending.maxEpoch,
                randomness: pending.randomness,
              }),
            });
            if (prove.ok) {
              const { inputs, maxEpoch, validUntilMs } = (await prove.json()) as {
                inputs: unknown;
                maxEpoch: number;
                validUntilMs: number;
              };
              sessionStorage.setItem(
                'splash.zklogin.signer',
                JSON.stringify({ ephemeralSecret: pending.ephemeralSecret, maxEpoch, validUntilMs, inputs }),
              );
            }
          } catch {
            // No signer cached; the wallet screen falls back to the passkey.
          }
        }

        // Identity is established. Authority is not — and neither is the
        // business verification that authority depends on.
        //
        // This used to land on /dashboard, which showed an empty workspace and
        // a banner. A banner is not an onboarding step: it tells someone
        // something is wrong and leaves them to find the screen that fixes it.
        // Business verification is the next thing that has to happen, so it is
        // the next thing they see.
        router.replace('/settings/kyb?from=signin');
      } catch {
        if (!cancelled) setError('Sign-in could not be completed. Check your connection and try again.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <main className="iso-auth-callback">
        <h1>Sign-in did not complete</h1>
        <p role="alert">{error}</p>
        <a href="/login">Back to sign in</a>
      </main>
    );
  }

  return <SplashLoading label="Verifying your sign-in" />;
}
