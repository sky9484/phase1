'use client';

import { motion } from 'framer-motion';
import { Quote, Sparkles } from 'lucide-react';

const customers = [
  {
    company: 'Acme Trading Sdn Bhd',
    segment: 'Regional exporter',
    quote: 'Splash gave our finance team one controlled workflow for supplier payouts across Malaysia, Singapore, and the Philippines.',
    stat: '68%',
    statLabel: 'less manual reconciliation',
  },
  {
    company: 'Manila Apparel Co.',
    segment: 'Marketplace supplier',
    quote: 'We can see settlement state, FX, and payout references without chasing three different banking portals.',
    stat: '4.2M',
    statLabel: 'monthly cleared volume',
  },
  {
    company: 'Jakarta Logistics',
    segment: 'Cross-border operator',
    quote: 'Batch payouts are now reviewed, screened, authorized, and receipted from a single console.',
    stat: '99.997%',
    statLabel: 'corridor uptime',
  },
];

const proof = ['Exporters', 'Marketplaces', 'BPO payroll', 'Logistics', 'Supplier finance', 'Treasury teams'];

export default function CustomerSection() {
  return (
    <section id="customers" className="relative bg-[#F6F0ED] py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E39774]/25 bg-[#E39774]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#C97A56]">
            <Sparkles className="h-3.5 w-3.5" />
            Customer proof
          </div>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#1F4452] md:text-5xl">Designed for teams moving real money across SEA.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#326273]/75">From supplier payouts to marketplace disbursements, Splash gives operators a faster way to clear, track, and reconcile cross-border payments.</p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {customers.map((customer, index) => (
            <motion.article
              key={customer.company}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="flex min-h-[320px] flex-col rounded-3xl border border-[#326273]/10 bg-white/70 p-7 shadow-lg shadow-[#326273]/5 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <Quote className="h-8 w-8 text-[#E39774]" />
              <p className="mt-6 flex-1 text-base leading-7 text-[#326273]/80">“{customer.quote}”</p>
              <div className="mt-8 border-t border-[#326273]/10 pt-5">
                <div className="font-bold text-[#1F4452]">{customer.company}</div>
                <div className="mt-1 text-sm text-[#6E8A95]">{customer.segment}</div>
                <div className="mt-5 flex items-end justify-between gap-4 rounded-2xl bg-[#F6F0ED]/80 p-4">
                  <div className="font-mono text-2xl font-semibold text-[#5C9EAD]">{customer.stat}</div>
                  <div className="max-w-[120px] text-right text-xs uppercase tracking-[0.12em] text-[#6E8A95]">{customer.statLabel}</div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {proof.map((item) => (
            <span key={item} className="rounded-full border border-[#326273]/10 bg-white/60 px-4 py-2 text-sm font-medium text-[#326273] shadow-sm">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
