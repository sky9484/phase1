'use client';

import { motion } from 'framer-motion';
import { Quote, Sparkles } from 'lucide-react';

const customers = [
  {
    company: 'Manila BPO Group',
    segment: 'Payroll operator · Philippines',
    quote: 'We pay 400 remote contractors across SEA every month. Splash cut our payroll run from 2 days of bank coordination to a single CSV upload. The batch settled in under a second.',
    stat: '$4.2M',
    statLabel: 'monthly cleared',
    corridor: 'USD → PHP',
  },
  {
    company: 'Jakarta Textile Exports',
    segment: 'Cross-border exporter · Indonesia',
    quote: 'Our buyers are in the US. Our suppliers are in IDR. Splash bridges both sides with a transparent rate and an immutable receipt I can show any auditor.',
    stat: '68%',
    statLabel: 'less reconciliation time',
    corridor: 'USD → IDR',
  },
  {
    company: 'SG Marketplace Pte',
    segment: 'E-commerce marketplace · Singapore',
    quote: 'We disburse seller earnings across 6 corridors. The AI Copilot suggested batching 5 Philippine payments on Tuesday — saved $140 in FX spread that week alone.',
    stat: '99.997%',
    statLabel: 'corridor uptime',
    corridor: 'USD → SGD, PHP, MYR',
  },
];

const segments = ['BPO Payroll', 'Exporters', 'Marketplaces', 'Logistics', 'Supplier finance', 'Treasury teams', 'Staffing agencies', 'Freelance platforms'];

export default function CustomerSection() {
  return (
    <section id="customers" className="relative bg-[#F6F0ED] py-16">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E39774]/25 bg-[#E39774]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#C97A56]">
            <Sparkles className="h-3.5 w-3.5" />
            Who uses Splash
          </div>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#1F4452] md:text-5xl">
            Designed for teams moving real money globally.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#326273]/75">
            From supplier payouts to marketplace disbursements, Splash gives operators a faster way to clear, track, and reconcile cross-border USD payments — with AI that learns your patterns and on-chain receipts that prove every settlement.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {customers.map((customer, index) => (
            <motion.article
              key={customer.company}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="flex min-h-[340px] flex-col rounded-3xl border border-[#326273]/10 bg-white/70 p-7 shadow-lg shadow-[#326273]/5 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <Quote className="h-7 w-7 text-[#E39774]" />
                <span className="rounded-full border border-[#5C9EAD]/20 bg-[#5C9EAD]/8 px-2.5 py-1 font-mono text-[10px] font-bold text-[#5C9EAD]">
                  {customer.corridor}
                </span>
              </div>
              <p className="mt-5 flex-1 text-base leading-7 text-[#326273]/80">"{customer.quote}"</p>
              <div className="mt-7 border-t border-[#326273]/10 pt-5">
                <div className="font-bold text-[#1F4452]">{customer.company}</div>
                <div className="mt-0.5 text-sm text-[#6E8A95]">{customer.segment}</div>
                <div className="mt-4 flex items-end justify-between gap-4 rounded-2xl bg-[#F6F0ED]/80 p-4">
                  <div className="font-mono text-2xl font-semibold text-[#5C9EAD]">{customer.stat}</div>
                  <div className="max-w-[130px] text-right text-xs uppercase tracking-[0.12em] text-[#6E8A95]">{customer.statLabel}</div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2.5">
          {segments.map((item) => (
            <span key={item} className="rounded-full border border-[#326273]/10 bg-white/60 px-4 py-2 text-sm font-medium text-[#326273] shadow-sm">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
