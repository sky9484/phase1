'use client';

import { useCallback, useEffect, useState } from 'react';

import LocalTime from '@/components/LocalTime';

/**
 * Settings → Wallet (v15 §4): the business multisig as its members see it.
 *
 * Shows the address, who holds which key at what weight, the pending
 * recovery if one is running, and — verbatim, because the sentence is the
 * product — what Splash can and cannot do. Creation is one button when no
 * wallet exists; membership CHANGES are deliberately absent here for now:
 * adding a member migrates the address, and that flow ships with its own
 * warnings, not as a casual row action.
 */
type WalletSummary = {
  wallet: {
    address: string;
    version: number;
    threshold: number;
    status: 'active' | 'migrating' | 'retired';
    members: Array<{ role: string; kind: string; weight: number; label: string; mine: boolean }>;
    recovery: { noticeEndsAt: string; reason: string } | null;
  } | null;
  missing?: { backupPasskey: boolean; recoveryContact: boolean; splashCold: boolean };
  coldConfigured?: boolean;
  custody?: string;
  migrationNote?: string;
  reason?: string;
  error?: string;
};

const ROLE_NAME: Record<string, string> = {
  admin: 'Main admin',
  backup: 'Backup passkey',
  recovery: 'Recovery contact',
  'splash-cold': 'Splash recovery key',
};

const KIND_NAME: Record<string, string> = {
  zklogin: 'sign-in key',
  passkey: 'passkey',
  cold: 'offline key',
};

export default function WalletMembersCard() {
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [busy, setBusy] = useState<null | 'create' | 'cancel'>(null);
  const [error, setError] = useState('');

  const read = useCallback(async (): Promise<WalletSummary> => {
    try {
      const res = await fetch('/api/wallet', { cache: 'no-store' });
      if (res.status === 403) {
        return { wallet: null, reason: 'Wallets belong to a workspace. Ask your admin for access first.' };
      }
      return (await res.json()) as WalletSummary;
    } catch {
      return { wallet: null, error: 'The wallet could not be read. Reload to try again.' };
    }
  }, []);
  const load = useCallback(async () => setSummary(await read()), [read]);

  useEffect(() => {
    // The PasskeyEnrolment shape: an inline async IIFE with a cancel flag, so
    // an unmounted card never sets state and the effect lint rule can see the
    // await in front of every setState.
    let cancelled = false;
    void (async () => {
      const next = await read();
      if (!cancelled) setSummary(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [read]);

  async function create() {
    setBusy('create');
    setError('');
    try {
      const res = await fetch('/api/wallet', { method: 'POST' });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? 'The wallet could not be created.');
        return;
      }
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function cancelRecovery() {
    setBusy('cancel');
    setError('');
    try {
      const res = await fetch('/api/wallet/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? 'The recovery could not be cancelled.');
        return;
      }
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (!summary) return <p className="iso-passkey-note">Reading the wallet…</p>;

  if (!summary.wallet) {
    return (
      <div>
        <p>{summary.reason ?? summary.error ?? 'No business wallet yet.'}</p>
        {!summary.error && (
          <button type="button" className="iso-passkey-enrol focus-ring" onClick={() => void create()} disabled={busy === 'create'}>
            {busy === 'create' ? 'Creating…' : 'Create the business wallet'}
          </button>
        )}
        {error ? <p role="alert" className="iso-passkey-error">{error}</p> : null}
      </div>
    );
  }

  const { wallet } = summary;
  return (
    <div>
      <p className="iso-passkey-note">
        One wallet for the business, on Sui mainnet. Any key below with weight {wallet.threshold} signs a payment by
        itself; the weight-1 keys only ever act together.
      </p>
      <p style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: 13, wordBreak: 'break-all' }}>
        {wallet.address}
      </p>

      <ul style={{ display: 'grid', gap: 8, padding: 0, margin: '14px 0', listStyle: 'none' }}>
        {wallet.members.map((member) => (
          <li key={`${member.role}-${member.label}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span>
              {ROLE_NAME[member.role] ?? member.role}
              {member.mine ? ' — you' : ''}
              <span style={{ opacity: 0.7 }}> · {KIND_NAME[member.kind] ?? member.kind}</span>
            </span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>weight {member.weight}</span>
          </li>
        ))}
      </ul>

      {wallet.recovery ? (
        <div role="alert" style={{ margin: '12px 0' }}>
          <p>
            A recovery is in progress: {wallet.recovery.reason}. It can complete after{' '}
            <LocalTime value={wallet.recovery.noticeEndsAt} />. If you did not expect this, cancel it now.
          </p>
          <button type="button" className="iso-passkey-enrol focus-ring" onClick={() => void cancelRecovery()} disabled={busy === 'cancel'}>
            {busy === 'cancel' ? 'Cancelling…' : 'Cancel this recovery'}
          </button>
        </div>
      ) : null}

      {summary.missing?.backupPasskey || summary.missing?.recoveryContact ? (
        <p className="iso-passkey-note">
          {summary.missing.backupPasskey ? 'No backup passkey yet. ' : ''}
          {summary.missing.recoveryContact ? 'No recovery contact named yet. ' : ''}
          {summary.migrationNote}
        </p>
      ) : null}

      <p className="iso-passkey-note">{summary.custody}</p>
      {error ? <p role="alert" className="iso-passkey-error">{error}</p> : null}
    </div>
  );
}
