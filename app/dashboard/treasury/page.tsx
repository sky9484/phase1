'use client';

import { useEffect, useRef, useState } from 'react';
import DashboardPageLogo from '@/components/DashboardPageLogo';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Info,
  Landmark,
  Lock,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sprout,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
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

const DAILY_BARS_7D = [
  { day: 'Mon', label: 'Mon · 19 May', amount: 3.18 },
  { day: 'Tue', label: 'Tue · 20 May', amount: 3.21 },
  { day: 'Wed', label: 'Wed · 21 May', amount: 3.19 },
  { day: 'Thu', label: 'Thu · 22 May', amount: 3.24 },
  { day: 'Fri', label: 'Fri · 23 May', amount: 3.22 },
  { day: 'Sat', label: 'Sat · 24 May', amount: 3.25 },
  { day: 'Sun', label: 'Sun · 25 May', amount: 3.28 },
];

// 30-day series — simulated growth pattern with auto-compounded daily yield.
const DAILY_BARS_30D = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  // Slight upward trend + small noise to feel real.
  const base = 3.05 + (i / 30) * 0.30;
  const noise = Math.sin(i * 1.3) * 0.04 + Math.cos(i * 0.7) * 0.03;
  const amount = +(base + noise).toFixed(2);
  return { day: `D${day}`, label: `Day ${day} · ${day} Apr 2026`, amount };
});

// Distinct colour per day so adjacent bars read as separate (brand palette,
// cycled) — replaces the monochrome-green chart.
const BAR_COLORS = ['#5C9EAD', '#6FB4A0', '#D9A441', '#E39774', '#C97A56', '#7E93B0', '#4A8895'];

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
  const [chartRange, setChartRange]   = useState<'7d' | '30d'>('7d');
  const [hoveredBar, setHoveredBar]   = useState<number | null>(null);
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

  const bars        = chartRange === '7d' ? DAILY_BARS_7D : DAILY_BARS_30D;
  const maxBar      = Math.max(...bars.map((d) => d.amount));
  const minBar      = Math.min(...bars.map((d) => d.amount));
  const totalRange  = bars.reduce((sum, d) => sum + d.amount, 0);
  const avgBar      = totalRange / bars.length;
  const focusBar    = hoveredBar !== null ? bars[hoveredBar] : null;
  // Period-over-period delta: average of second half vs first half.
  const half        = Math.floor(bars.length / 2);
  const firstHalfAvg  = bars.slice(0, half).reduce((s, d) => s + d.amount, 0) / Math.max(1, half);
  const secondHalfAvg = bars.slice(half).reduce((s, d) => s + d.amount, 0) / Math.max(1, bars.length - half);
  const trendPct      = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

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
          <DashboardPageLogo src="/isometric/sui-logo-iso.svg" partner="Sui" label="Smart Treasury" />
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
          { label: 'Treasury Balance', val: `$${fmtUsd(balance)}`,          sub: 'USDsui staked',          icon: Wallet,    bg: 'bg-[#5C9EAD]/10', ac: 'text-[#5C9EAD]', subTone: 'muted' as const },
          { label: 'APY',              val: '4.8%',                          sub: autoCompound ? 'Auto-compound on · 4.91% eff.' : 'Simple interest', icon: TrendingUp, bg: 'bg-[#D9A441]/15', ac: 'text-[#C99A2E]', subTone: 'positive' as const },
          { label: 'Yield Earned (30d)',val: `$${yield30d.toFixed(2)}`,      sub: 'Credited daily at 00:01', icon: Sparkles,  bg: 'bg-[#6FB4A0]/18', ac: 'text-[#4F9C88]', subTone: 'positive' as const },
          { label: 'Days Active',      val: '31',                            sub: 'Since 27 Apr 2026',       icon: Clock,     bg: 'bg-[#326273]/10', ac: 'text-[#326273]', subTone: 'muted' as const },
        ].map(({ label, val, sub, icon: Icon, bg, ac, subTone }) => (
          <div key={label} className="dash-card dash-card-interactive p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#326273]/50">{label}</span>
              <div className={cn('rounded-lg p-1.5', bg)}><Icon size={14} className={ac} /></div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-[#1F4452]">{val}</div>
            <div className={cn('mt-0.5 text-[11px] font-medium', subTone === 'positive' ? 'text-emerald-600' : 'text-[#326273]/55')}>{sub}</div>
          </div>
        ))}
      </section>

      {/* Main layout */}
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">

        {/* ── Left ── */}
        <div className="space-y-5">

          {/* Yield chart — interactive */}
          <div className="dash-card-raised p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#1F4452]">Daily Yield</h2>
                  <span className={cn(
                    'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                    trendPct >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    <TrendingUp size={9} className={trendPct < 0 ? 'rotate-180' : undefined} />
                    {trendPct >= 0 ? '+' : ''}{trendPct.toFixed(1)}%
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-[#326273]/50">
                  {focusBar
                    ? <>Hovering <span className="font-semibold text-[#1F4452]">{focusBar.label}</span></>
                    : 'Auto-credited at 00:01 UTC daily · hover bars for details'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className="text-lg font-extrabold text-emerald-600">
                    +${focusBar ? focusBar.amount.toFixed(3) : dailyYield.toFixed(3)}
                  </div>
                  <div className="text-[11px] text-[#326273]/50">
                    {focusBar ? 'credited that day' : 'estimated today'}
                  </div>
                </div>
                {/* Range toggle */}
                <div className="inline-flex rounded-md bg-[#F6F0ED] p-0.5">
                  {(['7d', '30d'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setChartRange(r); setHoveredBar(null); }}
                      className={cn(
                        'rounded px-2.5 py-1 text-[10px] font-bold transition-colors',
                        chartRange === r
                          ? 'bg-white text-[#1F4452] shadow-sm'
                          : 'text-[#326273]/55 hover:text-[#326273]'
                      )}
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bars */}
            <div
              className={cn('mt-4 flex items-end', chartRange === '7d' ? 'gap-2' : 'gap-1')}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {bars.map((d, i) => {
                const range = maxBar - minBar || 1;
                const heightPct = 35 + ((d.amount - minBar) / range) * 65;
                const isMax = d.amount === maxBar;
                const isHover = hoveredBar === i;
                const barColor = BAR_COLORS[i % BAR_COLORS.length];
                return (
                  <div
                    key={d.day}
                    onMouseEnter={() => setHoveredBar(i)}
                    onClick={() => setHoveredBar(i)}
                    className="group relative flex flex-1 flex-col items-center gap-1 cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    {isHover && (
                      <div className="pointer-events-none absolute -top-12 z-10 whitespace-nowrap rounded-lg bg-[#1F4452] px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-xl">
                        <div className="text-white/60">{d.label}</div>
                        <div className="font-mono text-emerald-300">+${d.amount.toFixed(3)}</div>
                        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1F4452]" />
                      </div>
                    )}
                    {chartRange === '7d' && (
                      <span
                        className="text-[10px] font-semibold transition-colors"
                        style={{ color: barColor, opacity: isHover || isMax ? 1 : 0.85 }}
                      >
                        ${d.amount.toFixed(2)}
                      </span>
                    )}
                    <div className="relative w-full overflow-hidden rounded-t-md bg-[#F6F0ED]" style={{ height: 64 }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t-md transition-all duration-200"
                        style={{ height: `${heightPct}%`, backgroundColor: barColor, opacity: isHover ? 1 : isMax ? 0.95 : 0.72 }}
                      />
                    </div>
                    <span className={cn(
                      'truncate transition-colors',
                      chartRange === '7d' ? 'text-[10px]' : 'text-[8px]',
                      isHover ? 'font-semibold text-[#1F4452]' : 'text-[#326273]/40'
                    )}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Expanded stat row — 5 cards */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700/70">
                  <Sparkles size={10} /> Daily yield
                </div>
                <div className="mt-1 font-mono text-sm font-extrabold text-emerald-700">+${dailyYield.toFixed(3)}</div>
                <div className="mt-0.5 text-[9px] text-emerald-700/60">live · per block</div>
              </div>
              <div className="rounded-lg bg-[#F6F0ED] p-3">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#326273]/55">
                  <CalendarDays size={10} /> Period total
                </div>
                <div className="mt-1 font-mono text-sm font-extrabold text-[#1F4452]">+${totalRange.toFixed(2)}</div>
                <div className="mt-0.5 text-[9px] text-[#326273]/45">last {chartRange === '7d' ? '7 days' : '30 days'}</div>
              </div>
              <div className="rounded-lg bg-[#F6F0ED] p-3">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#326273]/55">
                  <TrendingUp size={10} /> Avg / day
                </div>
                <div className="mt-1 font-mono text-sm font-extrabold text-[#1F4452]">+${avgBar.toFixed(3)}</div>
                <div className="mt-0.5 text-[9px] text-[#326273]/45">range avg</div>
              </div>
              <div className="rounded-lg bg-[#F6F0ED] p-3">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#326273]/55">
                  <Wallet size={10} /> Est. monthly
                </div>
                <div className="mt-1 font-mono text-sm font-extrabold text-[#1F4452]">+${projMonthly.toFixed(2)}</div>
                <div className="mt-0.5 text-[9px] text-[#326273]/45">at current balance</div>
              </div>
              <div className="rounded-lg bg-[#5C9EAD]/10 p-3">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#5C9EAD]">
                  <PiggyBank size={10} /> Est. annual
                </div>
                <div className="mt-1 font-mono text-sm font-extrabold text-[#326273]">+${projAnnual.toFixed(2)}</div>
                <div className="mt-0.5 text-[9px] text-[#326273]/55">4.8% APY · 1y</div>
              </div>
            </div>
          </div>

          {/* Transaction history */}
          <div className="dash-card overflow-hidden">
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

          {/* How Smart Treasury Works */}
          <div className="dash-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#326273]/8 px-5 py-3">
              <div className="flex items-center gap-2">
                <Sprout size={14} className="text-emerald-600" />
                <h2 className="text-sm font-bold text-[#1F4452]">How Smart Treasury Works</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                Auto · non-custodial
              </span>
            </div>

            <div className="relative grid gap-0 sm:grid-cols-4">
              {/* Connector line (desktop) */}
              <div className="pointer-events-none absolute left-5 right-5 top-[3.25rem] hidden h-px bg-gradient-to-r from-emerald-300/0 via-emerald-400 to-[#5C9EAD]/40 sm:block" />

              {[
                { step: '01', title: 'Deposit USD', desc: 'Operating balance converts to USDsui via Stripe Bridge. Fully backed 1:1.', icon: CreditCard, accent: '#10B981', bg: 'bg-emerald-100', tag: 'Stripe Bridge' },
                { step: '02', title: 'Sui DeFi Yield', desc: 'USDsui deployed into audited Sui DeFi protocols. Yield accrues every block (~400ms).', icon: Zap, accent: '#0284C7', bg: 'bg-[#0284C7]/10', tag: 'OtterSec audited' },
                { step: '03', title: 'Auto-compound', desc: 'Daily yield is reinvested automatically, lifting nominal 4.8% APY to 4.91% effective.', icon: Sprout, accent: '#5C9EAD', bg: 'bg-[#5C9EAD]/10', tag: '4.91% eff. APY' },
                { step: '04', title: 'T+0 Withdraw', desc: 'Yield credited at 00:01 UTC. Withdraw to operating wallet instantly, anytime.', icon: PiggyBank, accent: '#E39774', bg: 'bg-[#E39774]/10', tag: 'Instant exit' },
              ].map(({ step, title, desc, icon: Icon, accent, bg, tag }, i, arr) => (
                <div
                  key={step}
                  className={cn(
                    'relative px-5 py-4',
                    i < arr.length - 1 && 'sm:border-r border-[#326273]/8'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ring-2 ring-white', bg)}
                      style={{ color: accent }}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#326273]/35">{step}</span>
                  </div>
                  <div className="mt-3 text-xs font-extrabold text-[#1F4452]">{title}</div>
                  <div className="mt-1 text-[11px] leading-[1.125rem] text-[#326273]/65">{desc}</div>
                  <div
                    className="mt-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: `${accent}15`, color: accent }}
                  >
                    <CheckCircle2 size={9} />
                    {tag}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer call-out */}
            <div className="flex flex-wrap items-center gap-3 border-t border-[#326273]/8 bg-gradient-to-r from-emerald-50 via-[#5C9EAD]/5 to-[#E39774]/5 px-5 py-3 text-[11px]">
              <div className="flex items-center gap-1.5 font-semibold text-[#1F4452]">
                <ShieldCheck size={12} className="text-emerald-600" /> Non-custodial · your wallet, your keys
              </div>
              <span className="text-[#326273]/30">•</span>
              <div className="flex items-center gap-1.5 text-[#326273]/65">
                <Lock size={11} className="text-[#5C9EAD]" /> No lockup · T+0 exit
              </div>
              <span className="text-[#326273]/30">•</span>
              <div className="flex items-center gap-1.5 text-[#326273]/65">
                <Sparkles size={11} className="text-[#E39774]" /> Yield offsets payment fees
              </div>
            </div>
          </div>
        </div>

        {/* ── Right ── */}
        <aside className="space-y-4">

          {/* Deposit / Withdraw form */}
          <div className="dash-card p-4">
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
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    value={amount}
                    onChange={(e) => {
                      const v = e.target.value;
                      // Allow empty, digits, single decimal point
                      if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) setAmount(v);
                    }}
                    placeholder="0.00"
                    className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#1F4452] placeholder-[#326273]/30 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(tab === 'deposit' ? '1000' : fmtUsd(Math.floor(balance)).replace(/,/g, ''))}
                    className="shrink-0 rounded-md bg-[#326273]/10 px-2 py-0.5 text-[10px] font-bold text-[#326273]/60 transition-colors hover:bg-[#326273]/20 hover:text-[#326273]"
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
          <div className="dash-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-[#1F4452]">Auto-compound</div>
                <div className="text-[11px] text-[#326273]/50">Reinvest yield daily → higher effective APY</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoCompound}
                aria-label="Toggle auto-compound"
                onClick={() => setAutoCompound((v) => !v)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2',
                  autoCompound ? 'bg-emerald-500' : 'bg-[#326273]/25 hover:bg-[#326273]/35'
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-1 ring-black/5 transition-transform duration-200 ease-out',
                    autoCompound ? 'translate-x-[22px]' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
            <div className={cn(
              'mt-3 overflow-hidden rounded-lg transition-all duration-200',
              autoCompound ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
            )}>
              <div className="bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                Yield reinvested daily compounds your 4.8% nominal rate to an effective <strong>4.91% APY</strong>. Based on current balance: +${(balance * 0.0491 / 365).toFixed(3)}/day.
              </div>
            </div>
          </div>

          {/* Risk & compliance */}
          <div className="dash-card p-4">
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
