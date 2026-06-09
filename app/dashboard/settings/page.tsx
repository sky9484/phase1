'use client';

import { useEffect, useState } from 'react';
import KybSettings from '@/components/KybSettings';
import AmlKytHealthPreview from '@/components/compliance/AmlKytHealthPreview';
import { AlertTriangle, CheckCircle2, CreditCard, FileText, KeyRound, LockKeyhole, Radar, ShieldCheck, SlidersHorizontal } from 'lucide-react';

export default function DashboardSettingsPage() {
  const [limits, setLimits] = useState([43, 58, 31]);
  const [security, setSecurity] = useState({
    totp: true,
    session: true,
    password: true,
    roles: true,
  });
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Initial date is set on mount to avoid SSR hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastSync(new Date());
    const interval = window.setInterval(() => {
      setLimits((current) => current.map((value) => Math.min(96, Math.max(8, value + Math.round(Math.random() * 4 - 1)))));
      setLastSync(new Date());
    }, 5500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="dash-kicker">Controls</span>
          <h1 className="dash-title mt-2">Compliance, security &amp; controls</h1>
          <p className="mt-0.5 max-w-2xl text-xs text-[#326273]/60">
            Manage the controls that decide whether a transfer can be authorized, queued, reviewed, or blocked.
          </p>
        </div>
        <div className="rounded-xl border border-[#326273]/10 bg-white px-3 py-2 text-xs font-semibold text-[#326273]">
          <div>Organization · Acme Trading Sdn Bhd</div>
          <div className="mt-0.5 text-[11px] font-normal text-[#326273]/50">Live sync · {lastSync?.toLocaleTimeString() ?? '—'}</div>
        </div>
      </header>

      <section className="grid gap-4 dash-reveal-stagger md:grid-cols-4">
        <StatusCard icon={ShieldCheck} label="KYB" value="Approved" tone="text-[#5C9EAD]" />
        <StatusCard icon={Radar} label="AML / PEP" value="Active" tone="text-[#5C9EAD]" />
        <StatusCard icon={AlertTriangle} label="KYT rules" value={`${security.roles ? 6 : 4} enabled`} tone="text-[#E39774]" />
        <StatusCard icon={LockKeyhole} label="2FA" value={security.totp ? "Required" : "Paused"} tone={security.totp ? "text-[#5C9EAD]" : "text-[#E39774]"} />
      </section>

      <KybSettings />

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel
          icon={Radar}
          title="AML / sanctions policy"
          description="Screening controls applied to every beneficiary and business principal."
          items={[
            ['OFAC / UN / EU / MAS / BNM lists', 'Enabled in preflight'],
            ['PEP self-declaration', 'Required for UBOs ≥25%'],
            ['Verification provider', 'Sumsub KYB WebSDK'],
            ['Sentinel dev terms', 'sanction, blocked, pep hit, watchlist'],
          ]}
        />
        <Panel
          icon={SlidersHorizontal}
          title="KYT rule engine"
          description="Transaction-monitoring rules applied before authorization."
          items={[
            ['LARGE_SINGLE_TRANSFER', 'Review above RM 20,000'],
            ['STRUCTURING_PATTERN', 'Review repeated beneficiaries'],
            ['HIGH_RISK_CORRIDOR', 'Block unsupported corridors'],
            ['VELOCITY_SPIKE', 'Review abnormal daily volume'],
          ]}
        />
      </section>

      <AmlKytHealthPreview />

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel
          icon={CreditCard}
          title="Funding rails"
          description="How money enters your Splash balance — bank rails only to protect transfer pricing."
          items={[
            ['Bank rails (primary)', 'ACH · wire · FPX (Airwallex / Stripe ACH)'],
            ['Card / Apple Pay funding', 'Disabled by default'],
            ['If card is enabled', 'Surcharged to pass processor cost through'],
            ['Stored credentials', 'None — no bank login held'],
          ]}
        />
        <Panel
          icon={SlidersHorizontal}
          title="Transaction limits"
          description="No monthly currency cap — Splash is USD-first, not an MSB. Limits are rail + KYB + AML driven."
          items={[
            ['Rail max / transfer', 'Bank ~$1,000,000 · FPX ~$250,000'],
            ['KYB-tier cap', 'Tier 1 $50k → Tier 2 $250k → Tier 3 $1M'],
            ['AML review threshold', 'Flagged above $10,000 (still processed)'],
            ['Monthly MYR cap', 'None — large B2B payments supported'],
          ]}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="dash-surface p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#326273]">Tier limits</h2>
              <p className="mt-1 text-sm text-[#326273]/60">Applied after KYB approval and checked on every transfer and batch row.</p>
            </div>
            <SlidersHorizontal className="text-[#5C9EAD]" />
          </div>
          <div className="mt-6 space-y-4">
            <Limit label="Tier 1 single transfer" value="RM 20,000" used={`${limits[0]}%`} />
            <Limit label="Tier 1 daily volume" value="RM 50,000" used={`${limits[1]}%`} />
            <Limit label="Tier 1 monthly volume" value="RM 200,000" used={`${limits[2]}%`} />
          </div>
        </div>

        <div className="dash-surface p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#326273]">Security controls</h2>
              <p className="mt-1 text-sm text-[#326273]/60">User-side authorization controls for Phase 1 business flows.</p>
            </div>
            <KeyRound className="text-[#5C9EAD]" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ControlCard label="TOTP authorization" value={security.totp ? "Mandatory" : "Paused"} detail="Required for transfer and batch authorization." active={security.totp} onToggle={() => setSecurity((current) => ({ ...current, totp: !current.totp }))} />
            <ControlCard label="Session cookie" value={security.session ? "HttpOnly" : "Review"} detail="Secure SameSite=Lax cookie target." active={security.session} onToggle={() => setSecurity((current) => ({ ...current, session: !current.session }))} />
            <ControlCard label="Password policy" value={security.password ? "12+ chars" : "Draft"} detail="HIBP check planned for signup and reset." active={security.password} onToggle={() => setSecurity((current) => ({ ...current, password: !current.password }))} />
            <ControlCard label="Role scoping" value={security.roles ? "Org-based" : "Limited"} detail="Owner, admin, operator, viewer model." active={security.roles} onToggle={() => setSecurity((current) => ({ ...current, roles: !current.roles }))} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel
          icon={FileText}
          title="Audit events"
          description="Every state-changing server action should write an immutable audit event."
          items={[
            ['auth.signin', 'Login event'],
            ['kyb.submitted', 'Document intake event'],
            ['transfer.authorized', 'TOTP authorization event'],
            ['batch.queued', 'Batch queue event'],
          ]}
        />
        <Panel
          icon={CheckCircle2}
          title="API / webhook readiness"
          description="Phase 2 surfaces are documented here but not user-enabled in Phase 1."
          items={[
            ['REST payouts API', 'Disabled until Phase 2'],
            ['Webhook endpoints', 'Disabled until Phase 2'],
            ['Outbound signing secret', 'Not generated'],
            ['Client API keys', 'Not generated'],
          ]}
        />
      </section>
    </div>
  );
}

function StatusCard({ icon: Icon, label, value, tone }: { icon: typeof ShieldCheck; label: string; value: string; tone: string }) {
  return (
    <div className="dash-block dash-block-interactive p-5">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#326273]/55">{label}</div>
        <Icon className={tone} size={18} />
      </div>
      <div className="dash-num mt-3 text-2xl font-extrabold text-[#0c3e48]">{value}</div>
    </div>
  );
}

function Panel({ icon: Icon, title, description, items }: { icon: typeof ShieldCheck; title: string; description: string; items: [string, string][] }) {
  return (
    <div className="dash-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#326273]">{title}</h2>
          <p className="mt-1 text-sm text-[#326273]/60">{description}</p>
        </div>
        <Icon className="text-[#5C9EAD]" />
      </div>
      <div className="mt-6 space-y-3">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 rounded-xl bg-[#F6F0ED] p-4">
            <span className="text-sm font-semibold text-[#326273]">{label}</span>
            <span className="text-right text-xs font-bold text-[#5C9EAD]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Limit({ label, value, used }: { label: string; value: string; used: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-[#326273]">{label}</span>
        <span className="text-[#326273]/60">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#F6F0ED]">
        <div className="h-full rounded-full bg-[#5C9EAD]" style={{ width: used }} />
      </div>
      <div className="mt-1 text-xs text-[#326273]/50">{used} used</div>
    </div>
  );
}

function ControlCard({ label, value, detail, active, onToggle }: { label: string; value: string; detail: string; active: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="w-full rounded-2xl border border-[#326273]/10 bg-[#F6F0ED] p-5 text-left transition-all hover:border-[#5C9EAD]/30 hover:shadow-md hover:shadow-[#5C9EAD]/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide text-[#326273]/60">{label}</div>
          <div className="mt-2 text-lg font-extrabold text-[#326273]">{value}</div>
          <div className="mt-1 text-xs text-[#326273]/60">{detail}</div>
        </div>
        <div className={`h-6 w-6 shrink-0 rounded-full border-2 transition-colors ${active ? 'border-[#5C9EAD] bg-[#5C9EAD]' : 'border-[#326273]/30'}`} />
      </div>
    </button>
  );
}
