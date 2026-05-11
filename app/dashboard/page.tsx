'use client';

import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock3,
  FileText,
  Layers,
  LineChart,
  RefreshCw,
  Send,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import HoverPopup from "@/components/HoverPopup";
import LiveExchangeTicker from "@/components/LiveExchangeTicker";
import StatusBadge from "@/components/StatusBadge";

const initialStats = [
  { label: "Total settled (30d)", value: "MYR 184,200.00", delta: "+12.4%", icon: Banknote, hoverTitle: "Settlement volume", hoverContent: "Total value settled across all corridors in the last 30 days. Updated every 5 minutes." },
  { label: "Active beneficiaries", value: "47", delta: "+3 this week", icon: Users, hoverTitle: "Beneficiaries", hoverContent: "Number of unique recipients with successful settlements in the last 30 days." },
  { label: "Avg. settlement time", value: "< 5 min", delta: "On target", icon: Clock3, hoverTitle: "Settlement speed", hoverContent: "Average time from authorization to final recipient credit. SLA target is < 10 minutes." },
  { label: "Operating balance", value: "MYR 52,440.00", delta: "Reconciled", icon: CheckCircle2, hoverTitle: "Account balance", hoverContent: "Current reconciled balance available for settlements. Updated after each settlement window." },
];

const quickActions = [
  { label: "New transfer", description: "Single beneficiary", href: "/dashboard/transfer", icon: Send, className: "bg-[#326273] hover:bg-[#264e5b]", iconClassName: "text-[#5C9EAD]" },
  { label: "Batch payout", description: "CSV authorization", href: "/dashboard/batch", icon: Layers, className: "bg-[#5C9EAD] hover:bg-[#4A8B9A]", iconClassName: "text-white" },
  { label: "Compliance", description: "KYB and limits", href: "/dashboard/settings", icon: ShieldCheck, className: "bg-[#E39774] hover:bg-[#cd825f]", iconClassName: "text-white" },
];

const pipeline = [
  { label: "Authorized", count: 8, amount: "MYR 21,400.00", tone: "bg-[#E39774]", hoverTitle: "Authorized transfers", hoverContent: "Transfers that have been authorized and are awaiting funding. Expected to move to 'On the way' within 10 minutes." },
  { label: "On the way", count: 5, amount: "MYR 13,920.00", tone: "bg-[#5C9EAD]", hoverTitle: "In transit", hoverContent: "Transfers that have been funded and are being settled through partner rails. Average transit time is 3-5 minutes." },
  { label: "Settled today", count: 19, amount: "MYR 68,880.00", tone: "bg-[#326273]", hoverTitle: "Completed settlements", hoverContent: "Transfers that have been successfully credited to recipient accounts today. All receipts recorded on-chain." },
];

const compliance = [
  { label: "KYB status", value: "Approved", status: "verified" as const, hoverTitle: "KYB verification", hoverContent: "Your business has completed KYB verification with Sumsub. Full access to all transfer corridors." },
  { label: "Risk tier", value: "Tier 1", status: "verified" as const, hoverTitle: "Risk assessment", hoverContent: "Low-risk tier based on transaction history and compliance posture. Higher daily limits available." },
  { label: "Daily limit used", value: "43%", status: "pending" as const, hoverTitle: "Daily limits", hoverContent: "43% of daily transfer limit used. You can still transfer up to MYR 57,000 more today." },
];

const activities = [
  { title: "Coins.ph vendor payout settled", ref: "ti_m8q4_9b21fa", amount: "PHP 42,180.00", status: "Settled", hoverTitle: "Transfer settled", hoverContent: "Transfer ID: ti_m8q4_9b21fa. Recipient credited at 14:32. Receipt recorded on-chain." },
  { title: "Batch payroll queued", ref: "batch_m8q2_12ac08", amount: "MYR 31,400.00", status: "Queued", hoverTitle: "Batch queued", hoverContent: "Batch ID: batch_m8q2_12ac08. 12 rows cleared. Awaiting TOTP authorization." },
  { title: "KYB document hash recorded", ref: "kyb_m8pv_4d9e10", amount: "Compliance", status: "Review", hoverTitle: "KYB update", hoverContent: "Case ID: kyb_m8pv_4d9e10. New document uploaded and hashed. Sumsub verification in progress." },
  { title: "FPX funding confirmation received", ref: "fpx_m8pr_77a932", amount: "MYR 18,000.00", status: "Matched", hoverTitle: "FPX confirmation", hoverContent: "Transaction ID: fpx_m8pr_77a932. Bank authorization confirmed via Maybank2u Biz." },
];

const corridors = [
  { pair: "MY → PH", volume: 126800, rate: 12.41, currency: "PHP", width: 82, sla: "4.2m", success: 99.8, hoverTitle: "Malaysia to Philippines", hoverContent: "Most active corridor. Partner: Coins.ph. Average settlement time: 4.2 minutes." },
  { pair: "MY → ID", volume: 38200, rate: 3348, currency: "IDR", width: 42, sla: "5.1m", success: 98.9, hoverTitle: "Malaysia to Indonesia", hoverContent: "Partner: HATA. Supports IDR payouts to all major Indonesian banks." },
  { pair: "MY → SG", volume: 19200, rate: 0.284, currency: "SGD", width: 24, sla: "3.0m", success: 99.5, hoverTitle: "Malaysia to Singapore", hoverContent: "Fast SGD payouts. Settlement in 3 minutes." },
  { pair: "MY → TH", volume: 8400, rate: 7.72, currency: "THB", width: 18, sla: "6.4m", success: 97.6, hoverTitle: "Malaysia to Thailand", hoverContent: "THB corridor in monitored rollout with lower live volume." },
];

const paymentStates = [
  { label: "Pending", count: 8, amount: "MYR 21,400.00", icon: Clock3, tone: "border-[#E39774]/30 bg-[#E39774]/10 text-[#E39774]" },
  { label: "Failed", count: 1, amount: "MYR 1,220.00", icon: XCircle, tone: "border-red-500/30 bg-red-500/10 text-red-600" },
  { label: "Success", count: 19, amount: "MYR 68,880.00", icon: CheckCircle2, tone: "border-[#5C9EAD]/30 bg-[#5C9EAD]/10 text-[#5C9EAD]" },
];

export default function DashboardOverview() {
  const [stats, setStats] = useState(initialStats);
  const [liveCorridors, setLiveCorridors] = useState(corridors);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStats((prev) =>
        prev.map((stat) => {
          if (stat.label === 'Total settled (30d)') {
            const current = Number.parseFloat(stat.value.replace('MYR ', '').replace(',', ''));
            const updated = current + Math.random() * 1000 - 500;
            return {
              ...stat,
              value: `MYR ${updated.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
            };
          }
          if (stat.label === 'Operating balance') {
            const current = Number.parseFloat(stat.value.replace('MYR ', '').replace(',', ''));
            const updated = current + Math.random() * 200 - 100;
            return {
              ...stat,
              value: `MYR ${updated.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
            };
          }
          return stat;
        })
      );
    }, 8000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLiveCorridors((previous) =>
        previous.map((corridor) => {
          const volumeDelta = Math.round(Math.random() * 1800);
          const rateDelta = (Math.random() - 0.48) * (corridor.rate * 0.0015);

          return {
            ...corridor,
            volume: corridor.volume + volumeDelta,
            rate: Math.max(corridor.rate + rateDelta, 0),
            width: Math.min(corridor.width + Math.random() * 1.6, 96),
          };
        })
      );
    }, 4500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <LiveExchangeTicker />
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-[#5C9EAD]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#5C9EAD]">Business console</div>
          <h1 className="text-3xl font-extrabold text-[#326273]">Overview</h1>
          <p className="mt-1 text-sm text-[#326273]/60">
            Acme Trading Sdn Bhd · MY to PH corridor · Updated 2 minutes ago
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status="verified" />
          <Link href="/dashboard/settings" className="rounded-xl border border-[#326273]/10 bg-white px-4 py-2 text-sm font-semibold text-[#326273] hover:border-[#5C9EAD]">
            Review limits
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {stats.map(({ label, value, delta, icon: Icon, hoverTitle, hoverContent }) => (
          <HoverPopup key={label} title={hoverTitle} content={hoverContent}>
            <div className="cursor-pointer rounded-2xl border border-[#326273]/10 bg-white p-5 transition-all hover:shadow-lg hover:shadow-[#5C9EAD]/10 hover:border-[#5C9EAD]/30">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-wide text-[#326273]/60">{label}</div>
                <div className="rounded-xl bg-[#F6F0ED] p-2 text-[#5C9EAD]">
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold text-[#326273]">{value}</div>
              <div className="mt-1 text-xs font-semibold text-[#5C9EAD]">{delta}</div>
            </div>
          </HoverPopup>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {quickActions.map(({ label, description, href, icon: Icon, className, iconClassName }) => (
          <Link key={href} href={href} className={`group flex min-h-24 items-center justify-between gap-4 rounded-2xl px-5 py-4 text-white transition-all hover:-translate-y-0.5 ${className}`}>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-2.5">
                <Icon className={`h-5 w-5 ${iconClassName}`} />
              </div>
              <div>
                <div className="text-base font-bold">{label}</div>
                <div className="mt-0.5 text-xs text-white/75">{description}</div>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {paymentStates.map(({ label, count, amount, icon: Icon, tone }) => (
          <div key={label} className={`rounded-2xl border p-5 ${tone}`}>
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wide">{label} payments</div>
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="text-3xl font-extrabold">{count}</div>
              <div className="text-right text-sm font-bold">{amount}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-[#326273]/10 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#326273]">Settlement pipeline</h2>
              <p className="mt-1 text-sm text-[#326273]/60">Server-authorized transfers moving through funding, settlement, and off-ramp stages.</p>
            </div>
            <LineChart className="text-[#5C9EAD]" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {pipeline.map((item) => (
              <HoverPopup key={item.label} title={item.hoverTitle} content={item.hoverContent}>
                <div className="cursor-pointer rounded-2xl bg-[#F6F0ED] p-5 transition-all hover:shadow-lg hover:shadow-[#5C9EAD]/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#326273]/70">{item.label}</span>
                    <span className={`h-3 w-3 rounded-full ${item.tone}`} />
                  </div>
                  <div className="mt-4 text-3xl font-extrabold text-[#326273]">{item.count}</div>
                  <div className="mt-1 text-sm font-semibold text-[#5C9EAD]">{item.amount}</div>
                </div>
              </HoverPopup>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-[#326273] p-5 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-white/60">Next settlement window</div>
                <div className="mt-1 text-2xl font-extrabold">Today, 16:30 MYT</div>
              </div>
              <div className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold">
                13 transfers · MYR 35,320.00
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#326273]/10 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#326273]">Compliance posture</h2>
              <p className="mt-1 text-sm text-[#326273]/60">Checks required before value moves.</p>
            </div>
            <ShieldCheck className="text-[#5C9EAD]" />
          </div>
          <div className="mt-6 space-y-4">
            {compliance.map((item) => (
              <HoverPopup key={item.label} title={item.hoverTitle} content={item.hoverContent}>
                <div className="grid min-h-20 cursor-pointer grid-cols-[1fr_auto] items-center gap-4 rounded-xl bg-[#F6F0ED] p-4 transition-all hover:shadow-lg hover:shadow-[#5C9EAD]/10">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#326273]">{item.label}</div>
                    <div className="mt-1 text-xs text-[#326273]/60">{item.value}</div>
                  </div>
                  <div className="justify-self-end">
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              </HoverPopup>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-[#326273]/10 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#326273]">Corridor performance</h2>
              <p className="mt-1 text-sm text-[#326273]/60">Locked-rate activity by payout corridor.</p>
            </div>
            <TrendingUp className="text-[#5C9EAD]" />
          </div>
          <div className="mt-6 space-y-4">
            {liveCorridors.map((corridor) => (
              <HoverPopup key={corridor.pair} title={corridor.hoverTitle} content={corridor.hoverContent}>
                <div className="cursor-pointer rounded-2xl border border-[#326273]/10 bg-[#F6F0ED] p-4 transition-all hover:-translate-y-0.5 hover:border-[#5C9EAD]/30">
                  <div className="mb-3 flex items-start justify-between gap-3 text-sm">
                    <div>
                      <span className="font-bold text-[#326273]">{corridor.pair}</span>
                      <div className="mt-1 text-xs text-[#326273]/50">{corridor.sla} SLA · {corridor.success.toFixed(1)}% success</div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#326273]/70">MYR {corridor.volume.toLocaleString()}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-[#5C9EAD] transition-all" style={{ width: `${corridor.width}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-[#326273]/60">
                    <span>Indicative rate</span>
                    <span className="font-mono font-bold text-[#326273]">1 MYR → {corridor.rate.toLocaleString(undefined, { maximumFractionDigits: corridor.currency === 'IDR' ? 0 : 3 })} {corridor.currency}</span>
                  </div>
                </div>
              </HoverPopup>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#326273]/10 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#326273]">Recent activity</h2>
              <p className="mt-1 text-sm text-[#326273]/60">Latest operational events across transfer, batch, KYB, and funding rails.</p>
            </div>
            <FileText className="text-[#5C9EAD]" />
          </div>
          <div className="mt-6 divide-y divide-[#326273]/10">
            {activities.map((activity) => (
              <HoverPopup key={activity.ref} title={activity.hoverTitle} content={activity.hoverContent}>
                <div className="cursor-pointer grid gap-3 py-4 md:grid-cols-[1fr_auto_auto] md:items-center transition-all hover:bg-[#F6F0ED]/50">
                  <div>
                    <div className="font-semibold text-[#326273]">{activity.title}</div>
                    <div className="mt-1 font-mono text-xs text-[#326273]/50">{activity.ref}</div>
                  </div>
                  <div className="text-sm font-bold text-[#326273]">{activity.amount}</div>
                  <div className="rounded-full bg-[#5C9EAD]/10 px-3 py-1 text-xs font-bold text-[#5C9EAD]">{activity.status}</div>
                </div>
              </HoverPopup>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <HoverPopup title="Reconciliation" content="Automated matching between ledger entries and on-chain settlement receipts. Last check: 2 minutes ago.">
          <div className="cursor-pointer rounded-2xl border border-[#326273]/10 bg-white p-6 transition-all hover:shadow-lg hover:shadow-[#5C9EAD]/10 hover:border-[#5C9EAD]/30">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-[#5C9EAD]/10 p-3 text-[#5C9EAD]">
                <RefreshCw />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#326273]">Reconciliation status</h2>
                <p className="mt-2 text-sm text-[#326273]/60">Ledger entries and settlement receipt mirrors are matched through the latest completed settlement window.</p>
                <div className="mt-4 inline-flex rounded-full bg-[#5C9EAD]/10 px-3 py-1 text-xs font-bold text-[#5C9EAD]">0 mismatches</div>
              </div>
            </div>
          </div>
        </HoverPopup>
        <HoverPopup title="Pending actions" content="Beneficiaries requiring attention before next batch payout. Purpose codes missing for 2 recipients.">
          <div className="cursor-pointer rounded-2xl border border-[#326273]/10 bg-white p-6 transition-all hover:shadow-lg hover:shadow-[#E39774]/10 hover:border-[#E39774]/30">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-[#E39774]/10 p-3 text-[#E39774]">
                <Clock3 />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#326273]">Pending actions</h2>
                <p className="mt-2 text-sm text-[#326273]/60">Two beneficiaries need updated purpose codes before the next batch payout can be authorized.</p>
                <Link href="/dashboard/batch" className="mt-4 inline-flex rounded-full bg-[#E39774]/10 px-3 py-1 text-xs font-bold text-[#E39774] hover:bg-[#E39774]/20">
                  Review batch readiness
                </Link>
              </div>
            </div>
          </div>
        </HoverPopup>
      </section>
    </div>
  );
}
