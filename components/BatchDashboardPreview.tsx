'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Flame, ArrowRight } from 'lucide-react';
import AmbientBackground from '@/components/AmbientBackground';

const rows = [
  { name: 'Acme Trading Corp', corridor: 'USD→PHP', amount: '12,400.00', local: '₱699,608', status: 'settled' },
  { name: 'Manila Apparel Co.', corridor: 'USD→PHP', amount: '8,750.50', local: '₱494,148', status: 'settled' },
  { name: 'Jakarta Logistics', corridor: 'USD→IDR', amount: '21,000.00', local: 'Rp 341.8M', status: 'settled' },
  { name: 'Singapore Wholesale', corridor: 'USD→SGD', amount: '5,300.00', local: 'S$7,128', status: 'pending' },
];

export default function BatchDashboardPreview() {
  return (
    <section id="network" className="relative overflow-hidden bg-white/40 py-16">
      <AmbientBackground variant="teal" sheen />
      <div className="container relative mx-auto grid items-center gap-12 px-6 lg:grid-cols-2">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E39774]/25 bg-[#E39774]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#C97A56]">
            <Flame className="h-3.5 w-3.5" />
            Atomic batch settlement
          </div>
          <h2 className="mb-4 text-4xl font-extrabold tracking-[-0.03em] text-[#326273]">
            One signature. Hundreds of vendors. All-or-nothing.
          </h2>
          <p className="mb-6 text-[#326273]/70">
            Upload a CSV, sign once, and Splash executes the entire payroll or supplier batch on Sui as a single hot-potato PTB. If any leg fails, the whole batch reverts — no partial settlement, no stuck funds, no manual cleanup.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              'CSV-driven onboarding for 1–10,000 recipients',
              'Hot-potato PTB: settle-or-revert in one transaction',
              'PDF receipt per vendor, anchored on Walrus',
              'USD in, local currency out — recipients see PHP/IDR/MYR',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[#326273]/80">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#5C9EAD]" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[#5C9EAD] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#5C9EAD]/25 transition-all hover:-translate-y-0.5 hover:bg-[#4A8895]"
            >
              Try batch payout
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/batch-template.csv"
              download
              className="inline-flex items-center gap-2 rounded-xl border border-[#326273]/15 bg-white/70 px-5 py-2.5 text-sm font-medium text-[#326273] transition-all hover:border-[#5C9EAD]/30"
            >
              Download CSV template
            </a>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-[#326273]/10 bg-white p-6 shadow-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-xs text-[#326273]/40">batch_2026_q2_payroll.csv</div>
              <div className="mt-0.5 text-xs font-semibold text-[#6E8A95]">4 recipients · $47,450.50 USD total</div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-[#E39774]/30 bg-[#E39774]/10 px-2.5 py-1 text-xs font-bold text-[#C97A56]">
              <Flame className="h-3 w-3" />
              PTB active
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#326273]/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#326273]/12 bg-[#F6F0ED]/70 text-left text-[10px] font-bold uppercase tracking-widest text-[#326273]/50">
                <th className="px-3 py-2.5">Vendor</th>
                <th className="px-2 py-2.5">Corridor</th>
                <th className="px-2 py-2.5 text-right">USD</th>
                <th className="px-2 py-2.5 text-right">Local</th>
                <th className="px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name} className="border-b border-[#326273]/8 transition-colors last:border-0 hover:bg-[#F6F0ED]/45">
                  <td className="px-3 py-3 font-semibold text-[#1F4452]">{row.name.split(' ')[0]}</td>
                  <td className="px-2 py-3 font-mono text-xs text-[#6E8A95]">{row.corridor}</td>
                  <td className="px-2 py-3 text-right font-mono text-xs text-[#326273]">${row.amount}</td>
                  <td className="px-2 py-3 text-right font-mono text-xs text-[#5C9EAD]">{row.local}</td>
                  <td className="px-3 py-3">
                    {row.status === 'settled' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
                        <CheckCircle2 size={12} />
                        Settled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E39774]/12 px-2 py-0.5 text-xs font-semibold text-[#C97A56]">
                        <Loader2 size={12} className="animate-spin" />
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#326273]/15 bg-[#F6F0ED]/60">
                <td className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#6E8A95]" colSpan={2}>
                  Batch total
                </td>
                <td className="px-2 py-2.5 text-right font-mono text-xs font-bold text-[#1F4452]">$47,450.50</td>
                <td className="px-2 py-2.5 text-right font-mono text-[10px] text-[#5C9EAD]">3 currencies</td>
                <td className="px-3 text-[10px] font-bold uppercase text-[#C97A56]">PTB-pending</td>
              </tr>
            </tfoot>
          </table>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl border border-[#326273]/10 bg-[#F6F0ED]/70 p-3">
            <div className="text-center">
              <div className="font-mono text-sm font-bold text-[#1F4452]">4</div>
              <div className="text-[9px] uppercase tracking-wider text-[#6E8A95]">recipients</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-sm font-bold text-[#5C9EAD]">421ms</div>
              <div className="text-[9px] uppercase tracking-wider text-[#6E8A95]">est. settle</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-sm font-bold text-[#C97A56]">$379.60</div>
              <div className="text-[9px] uppercase tracking-wider text-[#6E8A95]">fee · 0.80%</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-sm font-bold text-green-600">$0.00</div>
              <div className="text-[9px] uppercase tracking-wider text-[#6E8A95]">gas paid</div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-gradient-to-br from-[#173742] to-[#0e2731] p-4 shadow-lg ring-1 ring-white/5">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#E39774]">
                PTB construction
              </div>
              <div className="font-mono text-[10px] text-white/40">tx_8f3c…a2e1</div>
            </div>

            <div className="overflow-hidden rounded-lg border border-white/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/[0.04] text-left text-[10px] uppercase tracking-widest text-white/45">
                    <th className="px-3 py-2 font-semibold">#</th>
                    <th className="px-3 py-2 font-semibold">Operation</th>
                    <th className="px-3 py-2 text-right font-semibold">State</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { n: '1', op: 'create PaymentIntent <USDsui>', st: 'Built' },
                    { n: '2', op: 'settle → consume hot potato', st: 'Consumed' },
                    { n: '3', op: 'freeze PaymentReceipt on Sui', st: 'Frozen' },
                    { n: '4', op: 'anchor Merkle root on Walrus', st: 'Anchored' },
                  ].map(({ n, op, st }) => (
                    <tr key={n} className="border-t border-white/[0.06]">
                      <td className="px-3 py-2 font-mono text-white/45">{n}</td>
                      <td className="px-3 py-2 font-mono text-white/80">{op}</td>
                      <td className="px-3 py-2 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-green-300">
                          <CheckCircle2 className="h-3 w-3" />
                          {st}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 font-mono text-[10px] text-white/55">
              <span>Entire batch</span>
              <span className="text-[#5C9EAD]">settle or revert · atomic</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
