'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  Landmark,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '../../../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type TxType = 'deposit' | 'withdraw' | 'yield';
type HistoryEntry = {
  id: string;
  type: TxType;
  desc: string;
  amount: string;
  amountNum: number;
  date: string;
  status: 'confirmed' | 'pending';
};

// ─── Initial seed data ───────────────────────────────────────────────────────

const SEED_HISTORY: HistoryEntry[] = [
  { id: 'tx_t001', type: 'yield',    desc: 'Daily yield credit',             amount: '+$3.28',     amountNum:  3.28,     date: 'Today, 00:01',   status: 'confirmed' },
  { id: 'tx_t002', type: 'yield',    desc: 'Daily yield credit',             amount: '+$3.25',     amountNum:  3.25,     date: 'Yesterday',      status: 'confirmed' },
  { id: 'tx_t003', type: 'deposit',  desc: 'Deposit from operating wallet',  amount: '+$5,000.00', amountNum:  5000,     date: '26 May 2026',    status: 'confirmed' },
  { id: 'tx_t004', type: 'yield',    desc: 'Daily yield credit',             amount: '+$3.22',     amountNum:  3.22,     date: '25 May 2026',    status: 'confirmed' },
  { id: 'tx_t005', type: 'yield',    desc: 'Daily yield credit',             amount: '+$3.19',     amountNum:  3.19,     date: '24 May 2026',    status: 'confirmed' },
  { id: 'tx_t006', type: 'withdraw', desc: 'Withdraw to operating wallet',   amount: '-$2,000.00', amountNum: -2000,     date: '23 May 2026',    status: 'confirmed' },
  { id: 'tx_t007', type: 'deposit',  desc: 'Deposit from operating wallet',  amount: '+$8,000.00', amountNum:  8000,     date: '20 May 2026',    status: 'confirmed' },
  { id: 'tx_t008', type: 'yield',    desc: 'Daily yield credit',             amount: '+$3.18',     amountNum:  3.18,     date: '19 May 2026',    status: 'confirmed' },
];

const DAILY_BARS = [
  { day: 'Mon', amount: 3.18 },
  { day: 'Tue', amount: 3.21 },
  { day: 'Wed', amount: 3.19 },
  { day: 'Thu', amount: 3.24 },
  { day: 'Fri', amount: 3.22 },
  { day: 'Sat', amount: 3.25 },
  { day: 'Sun', amount: 3.28 },
];

const RISK_ITEMS = [
  { label: 'Regulatory',      value: 'Labuan FSA MSB Application',       icon: Landmark,   },
  { label: 'Smart Contract',  value: 'Sui Move · audited by OtterSec',   icon: ShieldCheck },
  { label: 'Custody',         value: 'Non-custodial · your wallet key',  icon: Lock        },
  { label: 'Liquidity',       value: 'T+0 withdrawal to operating',      icon: Zap         },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtUsd(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function nowLabel() {
  return new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function HistIcon({ type }: { type: TxType }) {
  if (type === 'deposit')  return <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100"><ArrowDownLeft size={14} className="text-emerald-600" /></div>;
  if (type === 'withdraw') return <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100"><ArrowUpRight size={14} className="text-amber-600" /></div>;
  return <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5C9EAD]/10"><Sparkles size={14} className="text-[#5C9EAD]" /></div>;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TreasuryPage() {
  const [balance, setBalance]         = useState(24500.00);
  const [yield30d, setYield30d]       = useState(98.72);
  const [history, setHistory]         = useState<HistoryEntry[]>(SEED_HISTORY);
  const [tab, setTab]                 = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount]           = useState('');
  const [autoCompound, setAutoCompound] = useState(true);
  const [toast, setToast]             = useState('');
  const [loading, setLoading]         = useState(false);
  const counterRef                    = useRef(9);

  // Live yield tick
  useEffect(() => {
    const id = setInterval(() => {
      const tick = 0.002 + Math.random() * 0.003;
      setBalance((v) => v + tick);
      setYield30d((v) => v + tick);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const dailyYield  = balance * 0.048 / 365;
  const projMonthly = dailyYield * 30;
  const projAnnual  = balance * 0.048;
  const maxBar      = Math.max(...DAILY_BARS.map((d) => d.amount));

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number.parseFloat(amount);
    if (!Number.isFinite(n) || n <= 0) return;
    if (tab === 'withdraw' && n > balance) {
      showToast('Insufficient treasury balance');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const id = `tx_t${String(counterRef.current++).padStart(3, '0')}`;
      if (tab === 'deposit') {
        setBalance((v) => v + n);
        setYield30d((v) => v); // doesn't change yield history
        setHistory((prev) => [{
          id, type: 'deposit',
          desc: 'Deposit from operating wallet',
          amount: `+$${fmtUsd(n)}`, amountNum: n,
          date: nowLabel(), status: 'confirmed',
        }, ...prev]);
        showToast(`$${fmtUsd(n)} deposited to Smart Treasury`);
      } else {
        setBalance((v) => Math.max(0, v - n));
        setHistory((prev) => [{
          id, type: 'withdraw',
          desc: 'Withdraw to operating wallet',
          amount: `-$${fmtUsd(n)}`, amountNum: -n,
          date: nowLabel(), status: 'confirmed',
        }, ...prev]);
        showToast(`$${fmtUsd(n)} withdrawn to operating`);
      }
      setAmount('');
      setLoading(false);
    }, 900);
  }

  const parsedAmount = Number.parseFloat(amount);
  const previewBalance = Number.isFinite(parsedAmount) && parsedAmount > 0
    ? tab === 'deposit' ? balance + parsedAmount : Math.max(0, balance - parsedAmount)
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#1F4452] px-4 py-3 text-sm font-semibold text-white shadow-xl">
          <CheckCircle2 size={15} className="text-emerald-400" /> {toast}
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
            <TrendingUp size={11} /> Smart Treasury
          </div>
          <h1 className="text-2xl font-extrabold text-[#1F4452]">Smart Treasury</h1>
          <p className="mt-0.5 text-xs text-[#326273]/50">
            Idle USD earns 4.8% APY automatically · powered by USDsui on Sui
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">4.8% APY</span>
          <span className="rounded-full border border-[#326273]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#326273]/60">Labuan FSA · Sui DeFi</span>
        </div>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Treasury Balance', val: `$${fmtUsd(balance)}`,          sub: 'USDsui staked',          icon: Wallet,    bg: 'bg-emerald-100', ac: 'text-emerald-600' },
          { label: 'APY',              val: '4.8%',                          sub: autoCompound ? 'Auto-compound on · 4.91% eff.' : 'Simple interest', icon: TrendingUp, bg: 'bg-emerald-100', ac: 'text-emerald-600' },
          { label: 'Yield Earned (30d)',val: `$${yield30d.toFixed(2)}`,      sub: 'Credited daily at 00:01', icon: Sparkles,  bg: 'bg-[#5C9EAD]/10', ac: 'text-[#5C9EAD]' },
          { label: 'Days Active',      val: '31',                            sub: 'Since 27 Apr 2026',       icon: Clock,     bg: 'bg-[#326273]/10', ac: 'text-[#326273]' },
        ].map(({ label, val, sub, icon: Icon, bg, ac }) => (
          <div key={label} className="rounded-xl border border-white/70 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#326273]/50">{label}</span>
              <div className={cn('rounded-lg p-1.5', bg)}><Icon size={14} className={ac} /></div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-[#1F4452]">{val}</div>
            <div className="mt-0.5 text-[11px] font-medium text-emerald-600">{sub}</div>
          </div>
        ))}
      </section>

      {/* Main layout */}
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">

        {/* ── Left ── */}
        <div className="space-y-5">

          {/* Yield chart */}
          <div className="rounded-xl border border-white/70 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#1F4452]">Daily Yield (7d)</h2>
                <p className="mt-0.5 text-[11px] text-[#326273]/50">Auto-credited at 00:01 UTC daily</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-emerald-600">+${dailyYield.toFixed(3)}</div>
                <div className="text-[11px] text-[#326273]/50">estimated today</div>
              </div>
            </div>
            <div className="mt-4 flex items-end gap-2">
              {DAILY_BARS.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-emerald-600">${d.amount.toFixed(2)}</span>
                  <div className="relative w-full overflow-hidden rounded-t-md bg-[#F6F0ED]" style={{ height: 56 }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-md bg-emerald-400"
                      style={{ height: `${(d.amount / maxBar) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#326273]/40">{d.day}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-[#F6F0ED] p-3 text-xs">
              <div>
                <div className="text-[#326273]/50">Daily yield</div>
                <div className="mt-0.5 font-bold text-emerald-600">+${dailyYield.toFixed(3)}</div>
              </div>
              <div>
                <div className="text-[#326273]/50">Est. monthly</div>
                <div className="mt-0.5 font-bold text-emerald-600">+${projMonthly.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[#326273]/50">Est. annual</div>
                <div className="mt-0.5 font-bold text-emerald-600">+${projAnnual.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Transaction history */}
          <div className="overflow-hidden rounded-xl border border-white/70 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#326273]/8 px-4 py-3">
              <h2 className="text-sm font-bold text-[#1F4452]">Treasury Activity</h2>
              <button
                type="button"
                onClick={() => {
                  const yld = +(dailyYield).toFixed(3);
                  const id = `tx_t${String(counterRef.current++).padStart(3, '0')}`;
                  setYield30d((v) => v + yld);
                  setHistory((prev) => [{
                    id, type: 'yield', desc: 'Daily yield credit',
                    amount: `+$${yld}`, amountNum: yld, date: nowLabel(), status: 'confirmed',
                  }, ...prev]);
                  showToast('Refreshed · new yield credited');
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#5C9EAD] transition-colors hover:text-[#326273]"
              >
                <RefreshCw size={11} /> Refresh
              </button>
            </div>
            <div className="divide-y divide-[#326273]/5">
              {history.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#F6F0ED]/50">
                  <HistIcon type={tx.type} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#1F4452]">{tx.desc}</div>
                    <div className="text-[11px] text-[#326273]/45">{tx.date} · {tx.id}</div>
                  </div>
                  <div className="text-right">
                    <div className={cn('text-sm font-bold',
                      tx.type === 'withdraw' ? 'text-amber-600' :
                      tx.type === 'yield'    ? 'text-[#5C9EAD]' : 'text-emerald-600'
                    )}>
                      {tx.amount}
                    </div>
                    <div className={cn('text-[10px]', tx.status === 'confirmed' ? 'text-emerald-500' : 'text-amber-500')}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-xl border border-white/70 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-[#1F4452]">How Smart Treasury Works</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { step: '1', title: 'Deposit USD',    desc: 'Operating balance converts to USDsui via Stripe Bridge. Fully backed 1:1.', icon: Wallet    },
                { step: '2', title: 'Sui DeFi Yield', desc: 'USDsui deployed into audited Sui DeFi protocols. Yield accrues every block (~400ms).', icon: Zap       },
                { step: '3', title: 'Daily Credit',   desc: 'Yield credited to treasury at 00:01 UTC. Withdraw anytime, T+0 settlement.', icon: Sparkles  },
              ].map(({ step, title, desc, icon: Icon }) => (
                <div key={step} className="rounded-lg bg-[#F6F0ED] p-3.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-extrabold text-white">{step}</span>
                    <Icon size={14} className="text-emerald-600" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-[#1F4452]">{title}</div>
                  <div className="mt-1 text-[11px] leading-4.5 text-[#326273]/60">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right ── */}
        <aside className="space-y-4">

          {/* Deposit / Withdraw form */}
          <div className="rounded-xl border border-white/70 bg-white p-4 shadow-sm">
            <div className="flex rounded-lg bg-[#F6F0ED] p-1">
              {(['deposit', 'withdraw'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setAmount(''); }}
                  className={cn(
                    'flex-1 rounded-md py-1.5 text-xs font-bold capitalize transition-colors',
                    tab === t ? 'bg-white text-[#1F4452] shadow-sm' : 'text-[#326273]/50 hover:text-[#326273]'
                  )}
                >
                  {t === 'deposit' ? '↓ Deposit' : '↑ Withdraw'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-[#326273]/50">Amount (USD)</label>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-[#326273]/15 bg-[#F6F0ED] px-3 py-2.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                  <span className="text-sm font-semibold text-[#326273]/50">$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-sm font-bold text-[#1F4452] placeholder-[#326273]/30 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(tab === 'deposit' ? '1000' : fmtUsd(Math.floor(balance)).replace(/,/g, ''))}
                    className="shrink-0 rounded-md bg-[#326273]/10 px-2 py-0.5 text-[10px] font-bold text-[#326273]/60 hover:bg-[#326273]/20"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 rounded-lg bg-[#F6F0ED] p-3 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#326273]/55">Current balance</span>
                  <span className="font-semibold text-[#1F4452]">${fmtUsd(balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#326273]/55">APY</span>
                  <span className="font-semibold text-emerald-600">{autoCompound ? '4.91%' : '4.8%'} {autoCompound && <span className="text-[10px] text-emerald-500">(compounded)</span>}</span>
                </div>
                {previewBalance !== null && (
                  <div className="flex justify-between border-t border-[#326273]/10 pt-1.5">
                    <span className="font-semibold text-[#326273]/70">After {tab}</span>
                    <span className="font-bold text-[#1F4452]">${fmtUsd(previewBalance)}</span>
                  </div>
                )}
                {previewBalance !== null && tab === 'deposit' && Number.isFinite(parsedAmount) && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#326273]/45">New daily yield</span>
                    <span className="text-emerald-600 font-semibold">+${(previewBalance * 0.048 / 365).toFixed(3)}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !amount || Number.parseFloat(amount) <= 0}
                className={cn(
                  'w-full rounded-lg py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50',
                  tab === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800' : 'bg-[#E39774] hover:bg-[#C97A56] active:bg-[#b56a47]'
                )}
              >
                {loading ? 'Processing…' : tab === 'deposit' ? '↓ Deposit to Treasury' : '↑ Withdraw to Operating'}
              </button>
            </form>
          </div>

          {/* Auto-compound toggle */}
          <div className="rounded-xl border border-white/70 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-[#1F4452]">Auto-compound</div>
                <div className="text-[11px] text-[#326273]/50">Reinvest yield daily → higher effective APY</div>
              </div>
              <button
                type="button"
                onClick={() => setAutoCompound((v) => !v)}
                className={cn(
                  'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
                  autoCompound ? 'bg-emerald-500' : 'bg-[#326273]/20'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                  autoCompound ? 'translate-x-5' : 'translate-x-0.5'
                )} />
              </button>
            </div>
            <div className={cn(
              'mt-3 overflow-hidden rounded-lg transition-all duration-200',
              autoCompound ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
            )}>
              <div className="bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                Yield reinvested daily compounds your 4.8% nominal rate to an effective <strong>4.91% APY</strong>. Based on current balance: +${(balance * 0.0491 / 365).toFixed(3)}/day.
              </div>
            </div>
          </div>

          {/* Risk & compliance */}
          <div className="rounded-xl border border-white/70 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-[#5C9EAD]" />
              <h2 className="text-sm font-bold text-[#1F4452]">Risk & Compliance</h2>
            </div>
            <div className="mt-3 space-y-2">
              {RISK_ITEMS.map((r) => (
                <div key={r.label} className="flex items-start gap-2 rounded-lg bg-[#F6F0ED] px-3 py-2">
                  <r.icon size={13} className="mt-0.5 shrink-0 text-[#5C9EAD]" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-[#326273]/50">{r.label}</div>
                    <div className="text-xs font-semibold text-[#1F4452]">{r.value}</div>
                  </div>
                  <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-500" />
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5">
              <AlertCircle size={13} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-[11px] leading-4 text-amber-700">
                DeFi protocols carry smart contract risk. Your principal is backed 1:1 by USD via Stripe Bridge.
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-2">
            {[
              { label: 'View on Sui Explorer',   icon: Info,       href: 'https://suiscan.xyz/testnet' },
              { label: 'Labuan FSA application', icon: Landmark,   href: '#' },
              { label: 'OtterSec smart contract audit', icon: ShieldCheck, href: '#' },
            ].map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex w-full items-center justify-between rounded-lg border border-[#326273]/10 bg-white px-3 py-2.5 text-xs font-semibold text-[#326273] transition-colors hover:border-[#5C9EAD]/40 hover:text-[#5C9EAD]"
              >
                <div className="flex items-center gap-2"><Icon size={13} />{label}</div>
                <ChevronRight size={13} className="text-[#326273]/30" />
              </a>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
