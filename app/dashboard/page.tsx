'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock3,
  Layers,
  LineChart,
  RefreshCw,
  Send,
  ShieldCheck,
  TrendingUp,
  UserCircle,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import HoverPopup from "@/components/HoverPopup";
import LiveExchangeTicker from "@/components/LiveExchangeTicker";
import StatusBadge, { type Status } from "@/components/StatusBadge";
import { cn } from "../../lib/utils";

const initialStats = [
  { label: "Total settled (30d)", value: "$39,120.00", delta: "+12.4%", icon: Banknote, hoverTitle: "Settlement volume", hoverContent: "Total value settled across all corridors in the last 30 days. Updated every 5 minutes." },
  { label: "Active beneficiaries", value: "47", delta: "+3 this week", icon: Users, hoverTitle: "Beneficiaries", hoverContent: "Number of unique recipients with successful settlements in the last 30 days." },
  { label: "Avg. settlement time", value: "< 5 min", delta: "On target", icon: Clock3, hoverTitle: "Settlement speed", hoverContent: "Average time from authorization to final recipient credit. SLA target is < 10 minutes." },
  { label: "Operating balance", value: "$11,140.00", delta: "Reconciled", icon: CheckCircle2, hoverTitle: "Account balance", hoverContent: "Current reconciled balance available for settlements. Updated after each settlement window." },
];

const quickActions = [
  { label: "New transfer", description: "Single beneficiary", href: "/dashboard/transfers", icon: Send, className: "bg-[#326273] hover:bg-[#264e5b]", iconClassName: "text-[#5C9EAD]" },
  { label: "Batch payout", description: "CSV authorization", href: "/dashboard/batch", icon: Layers, className: "bg-[#5C9EAD] hover:bg-[#4A8B9A]", iconClassName: "text-white" },
  { label: "Recipients", description: "Manage beneficiaries", href: "/dashboard/recipients", icon: UserCircle, className: "bg-[#1F4452] hover:bg-[#143442]", iconClassName: "text-[#E39774]" },
  { label: "Compliance", description: "KYB and limits", href: "/dashboard/settings", icon: ShieldCheck, className: "bg-[#E39774] hover:bg-[#cd825f]", iconClassName: "text-white" },
];

const pipeline = [
  { label: "Authorized", count: 8, amount: "$4,540.00", tone: "bg-[#E39774]", hoverTitle: "Authorized transfers", hoverContent: "Transfers that have been authorized and are awaiting funding. Expected to move to 'On the way' within 10 minutes." },
  { label: "On the way", count: 5, amount: "$2,960.00", tone: "bg-[#5C9EAD]", hoverTitle: "In transit", hoverContent: "Transfers that have been funded and are being settled through partner rails. Average transit time is 3-5 minutes." },
  { label: "Settled today", count: 19, amount: "$14,640.00", tone: "bg-[#326273]", hoverTitle: "Completed settlements", hoverContent: "Transfers that have been successfully credited to recipient accounts today. All receipts recorded on-chain." },
];

const compliance = [
  { label: "KYB status", value: "Approved", status: "verified" as const, hoverTitle: "KYB verification", hoverContent: "Your business has completed KYB verification with Sumsub. Full access to all transfer corridors." },
  { label: "Risk tier", value: "Tier 1", status: "verified" as const, hoverTitle: "Risk assessment", hoverContent: "Low-risk tier based on transaction history and compliance posture. Higher daily limits available." },
  { label: "Daily limit used", value: "43%", status: "pending" as const, hoverTitle: "Daily limits", hoverContent: "43% of daily transfer limit used. You can still transfer up to $12,100 more today." },
];

const activities: Array<{
  title: string;
  ref: string;
  amount: string;
  status: Status;
  hoverTitle: string;
  hoverContent: string;
}> = [
  { title: "Coins.ph vendor payout settled", ref: "ti_m8q4_9b21fa", amount: "PHP 42,180.00", status: "verified", hoverTitle: "Transfer settled", hoverContent: "Transfer ID: ti_m8q4_9b21fa. Recipient credited at 14:32. Receipt recorded on-chain." },
  { title: "Batch payroll queued", ref: "batch_m8q2_12ac08", amount: "$6,670.00", status: "pending", hoverTitle: "Batch queued", hoverContent: "Batch ID: batch_m8q2_12ac08. 12 rows cleared. Awaiting TOTP authorization." },
  { title: "KYB document hash recorded", ref: "kyb_m8pv_4d9e10", amount: "Compliance", status: "pending", hoverTitle: "KYB update", hoverContent: "Case ID: kyb_m8pv_4d9e10. New document uploaded and hashed. Sumsub verification in progress." },
  { title: "Stripe deposit confirmed", ref: "stripe_m8pr_77a932", amount: "$3,820.00", status: "verified", hoverTitle: "Deposit confirmed", hoverContent: "Transaction ID: stripe_m8pr_77a932. Card deposit confirmed via Stripe Checkout." },
];

const corridors = [
  { pair: "USD → PHP", volume: 26900, rate: 56.42, currency: "PHP", width: 82, sla: "4.2m", success: 99.8, hoverTitle: "USD to Philippines", hoverContent: "Most active corridor. Partner: Coins.ph. Average settlement time: 4.2 minutes." },
  { pair: "USD → MYR", volume: 8100, rate: 4.71, currency: "MYR", width: 42, sla: "5.1m", success: 98.9, hoverTitle: "USD to Malaysia", hoverContent: "Partner: Airwallex FPX. Supports MYR payouts to all major Malaysian banks." },
  { pair: "USD → IDR", volume: 4080, rate: 16284, currency: "IDR", width: 24, sla: "3.0m", success: 99.5, hoverTitle: "USD to Indonesia", hoverContent: "Partner: local rails. Supports IDR payouts to all major Indonesian banks." },
  { pair: "USD → EUR", volume: 1790, rate: 0.924, currency: "EUR", width: 18, sla: "6.4m", success: 97.6, hoverTitle: "USD to Europe", hoverContent: "EUR corridor in monitored rollout with lower live volume." },
];

const paymentStates = [
  { label: "Pending", count: 8, amount: "$4,540.00", icon: Clock3, tone: "border-[#E39774]/30 bg-[#E39774]/10 text-[#E39774]" },
  { label: "Failed", count: 1, amount: "$260.00", icon: XCircle, tone: "border-red-500/30 bg-red-500/10 text-red-600" },
  { label: "Success", count: 19, amount: "$14,640.00", icon: CheckCircle2, tone: "border-[#5C9EAD]/30 bg-[#5C9EAD]/10 text-[#5C9EAD]" },
];

export default function DashboardOverview() {
  const [stats, setStats] = useState(initialStats);
  const [liveCorridors, setLiveCorridors] = useState(corridors);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStats((prev) =>
        prev.map((stat) => {
          if (stat.label === 'Total settled (30d)') {
            const current = Number.parseFloat(stat.value.replace('$', '').replace(',', ''));
            const updated = current + Math.random() * 1000 - 500;
            return {
              ...stat,
              value: `$${updated.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
            };
          }
          if (stat.label === 'Operating balance') {
            const current = Number.parseFloat(stat.value.replace('$', '').replace(',', ''));
            const updated = current + Math.random() * 200 - 100;
            return {
              ...stat,
              value: `$${updated.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
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
    <div className="space-y-5">
      <LiveExchangeTicker />

      <header className={cn('flex', 'flex-col', 'gap-2', 'md:flex-row', 'md:items-end', 'md:justify-between')}>
        <div>
          <div className={cn('mb-1', 'inline-flex', 'rounded-full', 'bg-[#5C9EAD]/10', 'px-2', 'py-0.5', 'text-[11px]', 'font-bold', 'uppercase', 'tracking-wide', 'text-[#5C9EAD]')}>Business console</div>
          <h1 className={cn('text-2xl', 'font-extrabold', 'text-[#326273]')}>Overview</h1>
          <p className={cn('mt-0.5', 'text-xs', 'text-[#326273]/60')}>
            Acme Trading Sdn Bhd · MY to PH corridor · Updated 2 minutes ago
          </p>
        </div>
        <div className={cn('flex', 'items-center', 'gap-2')}>
          <StatusBadge status="verified" />
          <Link href="/dashboard/settings" className={cn('rounded-lg', 'border', 'border-[#326273]/10', 'bg-white', 'px-3', 'py-1.5', 'text-xs', 'font-semibold', 'text-[#326273]', 'hover:border-[#5C9EAD]')}>
            Review limits
          </Link>
        </div>
      </header>

      <section className={cn('grid', 'grid-cols-2', 'gap-3', 'xl:grid-cols-4')}>
        {stats.map(({ label, value, delta, icon: Icon, hoverTitle, hoverContent }) => (
          <HoverPopup key={label} title={hoverTitle} content={hoverContent}>
            <div className={cn('cursor-pointer', 'rounded-xl', 'border', 'border-[#326273]/10', 'bg-white', 'p-3', 'transition-all', 'hover:shadow-md', 'hover:shadow-[#5C9EAD]/10', 'hover:border-[#5C9EAD]/30')}>
              <div className={cn('flex', 'items-center', 'justify-between', 'gap-2')}>
                <div className={cn('text-[11px]', 'uppercase', 'tracking-wide', 'text-[#326273]/60')}>{label}</div>
                <div className={cn('rounded-lg', 'bg-[#F6F0ED]', 'p-1.5', 'text-[#5C9EAD]')}>
                  <Icon size={14} />
                </div>
              </div>
              <div className={cn('mt-2', 'text-xl', 'font-extrabold', 'text-[#326273]')}>{value}</div>
              <div className={cn('mt-0.5', 'text-[11px]', 'font-semibold', 'text-[#5C9EAD]')}>{delta}</div>
            </div>
          </HoverPopup>
        ))}
      </section>

      <section className={cn('grid', 'grid-cols-2', 'gap-2', 'xl:grid-cols-4')}>
        {quickActions.map(({ label, description, href, icon: Icon, className, iconClassName }) => (
          <Link key={href} href={href} className={`group flex min-h-16 items-center justify-between gap-2 rounded-xl px-3 py-3 text-white transition-all hover:-translate-y-0.5 sm:px-4 ${className}`}>
            <div className={cn('flex', 'min-w-0', 'items-center', 'gap-2')}>
              <div className={cn('rounded-lg', 'bg-white/10', 'p-2')}>
                <Icon className={`h-4 w-4 ${iconClassName}`} />
              </div>
              <div className="min-w-0">
                <div className={cn('truncate', 'text-sm', 'font-bold')}>{label}</div>
                <div className={cn('mt-0.5', 'hidden', 'truncate', 'text-[11px]', 'text-white/75', 'sm:block')}>{description}</div>
              </div>
            </div>
            <ArrowUpRight className={cn('h-3.5', 'w-3.5', 'shrink-0', 'transition-transform', 'group-hover:translate-x-1')} />
          </Link>
        ))}
      </section>

      <section className={cn('grid', 'gap-5', 'xl:grid-cols-[1.6fr_1fr]')}>
        <div className="space-y-5">
          <div className={cn('grid', 'gap-3', 'sm:grid-cols-3')}>
            {paymentStates.map(({ label, count, amount, icon: Icon, tone }) => (
              <div key={label} className={`rounded-xl border p-3 ${tone}`}>
                <div className={cn('flex', 'items-center', 'justify-between')}>
                  <div className={cn('text-[11px]', 'font-bold', 'uppercase', 'tracking-wide')}>{label} payments</div>
                  <Icon className={cn('h-4', 'w-4')} />
                </div>
                <div className={cn('mt-2', 'flex', 'items-end', 'justify-between', 'gap-2')}>
                  <div className={cn('text-2xl', 'font-extrabold')}>{count}</div>
                  <div className={cn('text-right', 'text-xs', 'font-bold')}>{amount}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={cn('rounded-xl', 'border', 'border-[#326273]/10', 'bg-white', 'p-4')}>
            <div className={cn('flex', 'items-start', 'justify-between', 'gap-3')}>
              <div>
                <h2 className={cn('text-lg', 'font-bold', 'text-[#326273]')}>Settlement pipeline</h2>
                <p className={cn('mt-0.5', 'text-xs', 'text-[#326273]/60')}>Server-authorized transfers moving through funding, settlement, and off-ramp stages.</p>
              </div>
              <LineChart className="text-[#5C9EAD]" size={18} />
            </div>
            <div className={cn('mt-4', 'grid', 'gap-3', 'sm:grid-cols-3')}>
              {pipeline.map((item) => (
                <HoverPopup key={item.label} title={item.hoverTitle} content={item.hoverContent}>
                  <div className={cn('cursor-pointer', 'rounded-xl', 'bg-[#F6F0ED]', 'p-3', 'transition-all', 'hover:shadow-md', 'hover:shadow-[#5C9EAD]/10')}>
                    <div className={cn('flex', 'items-center', 'justify-between')}>
                      <span className={cn('text-xs', 'font-semibold', 'text-[#326273]/70')}>{item.label}</span>
                      <span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />
                    </div>
                    <div className={cn('mt-2', 'text-2xl', 'font-extrabold', 'text-[#326273]')}>{item.count}</div>
                    <div className={cn('mt-0.5', 'text-xs', 'font-semibold', 'text-[#5C9EAD]')}>{item.amount}</div>
                  </div>
                </HoverPopup>
              ))}
            </div>
            <div className={cn('mt-4', 'rounded-xl', 'bg-[#326273]', 'p-3', 'text-white')}>
              <div className={cn('flex', 'flex-col', 'gap-2', 'md:flex-row', 'md:items-center', 'md:justify-between')}>
                <div>
                  <div className={cn('text-xs', 'font-semibold', 'text-white/60')}>Next settlement window</div>
                  <div className={cn('mt-0.5', 'text-lg', 'font-extrabold')}>Today, 16:30 MYT</div>
                </div>
                <div className={cn('rounded-lg', 'bg-white/10', 'px-3', 'py-1.5', 'text-xs', 'font-semibold')}>
                  13 transfers · $7,510.00
                </div>
              </div>
            </div>
          </div>

          <div className={cn('rounded-xl', 'border', 'border-[#326273]/10', 'bg-white', 'p-4')}>
            <div className={cn('flex', 'items-start', 'justify-between', 'gap-3')}>
              <div>
                <h2 className={cn('text-lg', 'font-bold', 'text-[#326273]')}>Corridor performance</h2>
                <p className={cn('mt-0.5', 'text-xs', 'text-[#326273]/60')}>Locked-rate activity by payout corridor.</p>
              </div>
              <TrendingUp className="text-[#5C9EAD]" size={18} />
            </div>
            <div className={cn('mt-4', 'grid', 'gap-3', 'sm:grid-cols-2')}>
              {liveCorridors.map((corridor) => (
                <HoverPopup key={corridor.pair} title={corridor.hoverTitle} content={corridor.hoverContent}>
                  <div className={cn('cursor-pointer', 'rounded-xl', 'border', 'border-[#326273]/10', 'bg-[#F6F0ED]', 'p-3', 'transition-all', 'hover:-translate-y-0.5', 'hover:border-[#5C9EAD]/30')}>
                    <div className={cn('mb-2', 'flex', 'items-start', 'justify-between', 'gap-2', 'text-xs')}>
                      <div>
                        <span className={cn('font-bold', 'text-[#326273]')}>{corridor.pair}</span>
                        <div className={cn('mt-0.5', 'text-[11px]', 'text-[#326273]/50')}>{corridor.sla} SLA · {corridor.success.toFixed(1)}% success</div>
                      </div>
                      <span className={cn('rounded-full', 'bg-white', 'px-2', 'py-0.5', 'text-[11px]', 'font-bold', 'text-[#326273]/70')}>$ {corridor.volume.toLocaleString()}</span>
                    </div>
                    <div className={cn('h-2', 'overflow-hidden', 'rounded-full', 'bg-white')}>
                      <div className={cn('h-full', 'rounded-full', 'bg-[#5C9EAD]', 'transition-all')} style={{ width: `${corridor.width}%` }} />
                    </div>
                    <div className={cn('mt-1.5', 'flex', 'items-center', 'justify-between', 'text-[11px]', 'text-[#326273]/60')}>
                      <span>Indicative rate</span>
                      <span className={cn('font-mono', 'font-bold', 'text-[#326273]')}>1 USD → {corridor.rate.toLocaleString(undefined, { maximumFractionDigits: corridor.currency === 'IDR' ? 0 : 3 })} {corridor.currency}</span>
                    </div>
                  </div>
                </HoverPopup>
              ))}
            </div>
          </div>

          <div className={cn('rounded-xl', 'border', 'border-[#326273]/10', 'bg-white', 'p-4')}>
            <div className={cn('flex', 'items-start', 'justify-between', 'gap-3')}>
              <div>
                <h2 className={cn('text-lg', 'font-bold', 'text-[#326273]')}>Reconciliation status</h2>
                <p className={cn('mt-0.5', 'text-xs', 'text-[#326273]/60')}>Treasury balance and settlement window health.</p>
              </div>
              <CheckCircle2 className="text-[#5C9EAD]" size={18} />
            </div>
            <div className={cn('mt-4', 'grid', 'gap-3', 'sm:grid-cols-2')}>
              <div className={cn('rounded-lg', 'bg-[#F6F0ED]', 'p-3')}>
                <div className={cn('text-[11px]', 'uppercase', 'tracking-wide', 'text-[#326273]/60')}>Operating balance</div>
                <div className={cn('mt-1', 'text-xl', 'font-extrabold', 'text-[#326273]')}>$11,140.00</div>
                <div className={cn('mt-0.5', 'text-[11px]', 'font-semibold', 'text-[#5C9EAD]')}>Reconciled</div>
              </div>
              <div className={cn('rounded-lg', 'bg-[#F6F0ED]', 'p-3')}>
                <div className={cn('text-[11px]', 'uppercase', 'tracking-wide', 'text-[#326273]/60')}>Pending inflow</div>
                <div className={cn('mt-1', 'text-xl', 'font-extrabold', 'text-[#326273]')}>$4,540.00</div>
                <div className={cn('mt-0.5', 'text-[11px]', 'font-semibold', 'text-[#E39774]')}>Awaiting deposit</div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className={cn('rounded-xl', 'border', 'border-[#326273]/10', 'bg-white', 'p-4')}>
            <div className={cn('flex', 'items-start', 'justify-between', 'gap-3')}>
              <div>
                <h2 className={cn('text-lg', 'font-bold', 'text-[#326273]')}>Compliance posture</h2>
                <p className={cn('mt-0.5', 'text-xs', 'text-[#326273]/60')}>Checks required before value moves.</p>
              </div>
              <ShieldCheck className="text-[#5C9EAD]" size={18} />
            </div>
            <div className={cn('mt-4', 'space-y-3')}>
              {compliance.map((item) => (
                <HoverPopup key={item.label} title={item.hoverTitle} content={item.hoverContent}>
                  <div className={cn('grid', 'min-h-16', 'cursor-pointer', 'grid-cols-[1fr_auto]', 'items-center', 'gap-3', 'rounded-lg', 'bg-[#F6F0ED]', 'p-3', 'transition-all', 'hover:shadow-md', 'hover:shadow-[#5C9EAD]/10')}>
                    <div className="min-w-0">
                      <div className={cn('text-xs', 'font-semibold', 'text-[#326273]')}>{item.label}</div>
                      <div className={cn('mt-0.5', 'text-[11px]', 'text-[#326273]/60')}>{item.value}</div>
                    </div>
                    <div className="justify-self-end">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                </HoverPopup>
              ))}
            </div>
          </div>

          <div className={cn('rounded-xl', 'border', 'border-[#326273]/10', 'bg-white', 'p-4')}>
            <div className={cn('flex', 'items-start', 'justify-between', 'gap-3')}>
              <div>
                <h2 className={cn('text-lg', 'font-bold', 'text-[#326273]')}>Recent activity</h2>
                <p className={cn('mt-0.5', 'text-xs', 'text-[#326273]/60')}>Latest transfer, batch, and compliance events.</p>
              </div>
              <RefreshCw className="text-[#5C9EAD]" size={18} />
            </div>
            <div className={cn('mt-4', 'space-y-3')}>
              {activities.map((activity) => (
                <HoverPopup key={activity.ref} title={activity.hoverTitle} content={activity.hoverContent}>
                  <div className={cn('cursor-pointer', 'rounded-lg', 'bg-[#F6F0ED]', 'p-3', 'transition-all', 'hover:shadow-md', 'hover:shadow-[#5C9EAD]/10')}>
                    <div className={cn('flex', 'items-start', 'justify-between', 'gap-2')}>
                      <div className={cn('min-w-0', 'flex-1')}>
                        <div className={cn('text-xs', 'font-semibold', 'text-[#326273]')}>{activity.title}</div>
                        <div className={cn('mt-0.5', 'text-[11px]', 'text-[#326273]/60')}>{activity.ref}</div>
                      </div>
                      <div className={cn('shrink-0', 'text-right')}>
                        <StatusBadge status={activity.status} />
                        <div className={cn('mt-0.5', 'text-[11px]', 'font-bold', 'text-[#5C9EAD]')}>{activity.amount}</div>
                      </div>
                    </div>
                  </div>
                </HoverPopup>
              ))}
            </div>
          </div>

          <div className={cn('rounded-xl', 'border', 'border-[#326273]/10', 'bg-white', 'p-4')}>
            <div className={cn('flex', 'items-start', 'justify-between', 'gap-3')}>
              <div>
                <h2 className={cn('text-lg', 'font-bold', 'text-[#326273]')}>Pending actions</h2>
                <p className={cn('mt-0.5', 'text-xs', 'text-[#326273]/60')}>Items requiring your attention.</p>
              </div>
              <AlertTriangle className="text-[#E39774]" size={18} />
            </div>
            <div className={cn('mt-4', 'space-y-2')}>
              <div className={cn('flex', 'items-center', 'justify-between', 'rounded-lg', 'bg-[#F6F0ED]', 'p-3')}>
                <div className={cn('text-xs', 'font-semibold', 'text-[#326273]')}>Batch payroll awaiting TOTP</div>
                <Link href="/dashboard/batch" className={cn('rounded-md', 'bg-[#5C9EAD]', 'px-2.5', 'py-1', 'text-[11px]', 'font-bold', 'text-white', 'hover:bg-[#4A8895]')}>
                  Authorize
                </Link>
              </div>
              <div className={cn('flex', 'items-center', 'justify-between', 'rounded-lg', 'bg-[#F6F0ED]', 'p-3')}>
                <div className={cn('text-xs', 'font-semibold', 'text-[#326273]')}>KYB document review</div>
                <Link href="/dashboard/settings" className={cn('rounded-md', 'bg-[#5C9EAD]', 'px-2.5', 'py-1', 'text-[11px]', 'font-bold', 'text-white', 'hover:bg-[#4A8895]')}>
                  Review
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
