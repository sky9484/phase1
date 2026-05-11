'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

const rows = [
  { name: 'Acme Trading Sdn Bhd', country: 'MY', amount: '12,400.00', status: 'settled' },
  { name: 'Manila Apparel Co.', country: 'PH', amount: '8,750.50', status: 'settled' },
  { name: 'Jakarta Logistics', country: 'ID', amount: '21,000.00', status: 'settled' },
  { name: 'Singapore Wholesale Pte', country: 'SG', amount: '5,300.00', status: 'pending' },
];

export default function BatchDashboardPreview() {
  return (
    <section id="network" className="bg-white/40 py-24">
      <div className="container mx-auto grid items-center gap-12 px-6 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-4xl font-extrabold text-[#326273]">One signature. Hundreds of vendors. Atomic.</h2>
          <p className="mb-6 text-[#326273]/70">Upload a CSV, sign once, and Splash executes the entire payroll or supplier batch on Sui. If any leg fails, the whole batch reverts — no partial settlement risk.</p>
          <ul className="space-y-3 text-sm text-[#326273]/80">
            <li>CSV-driven onboarding for 1–10,000 recipients</li>
            <li>Pass-or-revert atomic semantics on Sui</li>
            <li>PDF receipt per vendor, signed event hash</li>
          </ul>
        </div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl border border-[#326273]/10 bg-white p-6 shadow-xl">
          <div className="mb-2 font-mono text-xs text-[#326273]/50">batch_2025_11_payroll.csv</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#326273]/10 text-left text-[#326273]/60">
                <th className="py-2">Vendor</th>
                <th>Country</th>
                <th className="text-right">Amount (USDC)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name} className="border-b border-[#326273]/5">
                  <td className="py-3 font-medium text-[#326273]">{row.name}</td>
                  <td className="text-[#326273]/70">{row.country}</td>
                  <td className="text-right font-mono text-[#326273]">{row.amount}</td>
                  <td>
                    {row.status === 'settled' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5C9EAD]"><CheckCircle2 size={14} /> Settled</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E39774]"><Loader2 size={14} className="animate-spin" /> Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
