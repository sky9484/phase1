'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const services = [
  {
    name: 'Traditional Bank',
    logo: '🏦',
    color: 'text-[#326273]',
  },
  {
    name: 'Wise',
    logo: '🌍',
    color: 'text-[#326273]',
  },
  {
    name: 'Splash',
    logo: '💧',
    color: 'text-[#5C9EAD]',
    highlight: true,
  },
];

const features = [
  { label: 'Settlement Speed', bank: '2-5 days', wise: '1-2 days', splash: '400ms' },
  { label: 'Fee Structure', bank: '3-5%', wise: '0.5-1.5%', splash: '0.8%+' },
  { label: 'FX Transparency', bank: 'Hidden markup', wise: 'Mid-market rate', splash: 'Live rates' },
  { label: 'Batch Support', bank: false, wise: false, splash: true },
  { label: 'Atomic Settlement', bank: false, wise: false, splash: true },
];

export default function ComparisonSection() {
  return (
    <section id="comparison" className="bg-[#F6F0ED] py-24">
      <div className="container mx-auto px-6">
        <div className="mb-12 max-w-2xl">
          <h2 className="mb-3 text-4xl font-extrabold text-[#326273]">Built for business, not consumers.</h2>
          <p className="text-[#326273]/70">Compare Splash with traditional banks and consumer remittance services for global cross-border payments. ASEAN Power House of Settlement Engine.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-2xl border border-[#326273]/10 bg-white shadow-xl"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#326273]/10 bg-[#F6F0ED]">
                <th className="p-4 text-left text-sm font-bold uppercase tracking-wide text-[#326273]/60">
                  Feature
                </th>
                {services.map((service) => (
                  <th
                    key={service.name}
                    className={`p-4 text-center ${service.highlight ? 'bg-[#5C9EAD]/10' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{service.logo}</span>
                        <span className={`text-lg font-bold ${service.color}`}>{service.name}</span>
                      </div>
                      {service.highlight && (
                        <span className="rounded-full bg-[#5C9EAD] px-3 py-1 text-xs font-bold text-white">
                          Best for B2B
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={feature.label} className="border-b border-[#326273]/5 last:border-0">
                  <td className="p-4 text-sm font-semibold text-[#326273]">{feature.label}</td>
                  <td className={`p-4 text-center ${index % 2 === 0 ? 'bg-white' : 'bg-[#F6F0ED]/30'}`}>
                    {typeof feature.bank === 'boolean' ? (
                      feature.bank ? (
                        <Check className="mx-auto h-5 w-5 text-[#326273]/40" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-[#326273]/40" />
                      )
                    ) : (
                      <span className="text-sm text-[#326273]/60">{feature.bank}</span>
                    )}
                  </td>
                  <td className={`p-4 text-center ${index % 2 === 0 ? 'bg-white' : 'bg-[#F6F0ED]/30'}`}>
                    {typeof feature.wise === 'boolean' ? (
                      feature.wise ? (
                        <Check className="mx-auto h-5 w-5 text-[#326273]/40" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-[#326273]/40" />
                      )
                    ) : (
                      <span className="text-sm text-[#326273]/60">{feature.wise}</span>
                    )}
                  </td>
                  <td className={`p-4 text-center bg-[#5C9EAD]/5 ${index % 2 === 0 ? '' : 'bg-[#5C9EAD]/10'}`}>
                    {typeof feature.splash === 'boolean' ? (
                      feature.splash ? (
                        <Check className="mx-auto h-5 w-5 text-[#5C9EAD]" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-[#326273]/40" />
                      )
                    ) : (
                      <span className="font-mono text-sm font-bold text-[#5C9EAD]">{feature.splash}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#5C9EAD]/20 bg-[#5C9EAD]/5 p-6">
            <h3 className="mb-4 text-xl font-bold text-[#326273]">Why starting from 0.8%?</h3>
            <div className="space-y-3 text-sm text-[#326273]/70">
              <p><strong className="text-[#326273]">Volume-based pricing:</strong> Larger transfers get better rates through treasury yield optimization.</p>
              <p><strong className="text-[#326273]">Yield generation:</strong> Your USD deposits earn yield in USDC while awaiting settlement, offsetting fees.</p>
              <p><strong className="text-[#326273]">Atomic batching:</strong> Group multiple transfers to share infrastructure costs and get volume discounts.</p>
              <p><strong className="text-[#326273]">No hidden markup:</strong> Transparent FX rates with no spread on the corridor side.</p>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-xl border border-[#326273]/10 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#326273]/60">Starting Fee</div>
                  <div className="text-2xl font-extrabold text-[#5C9EAD]">0.8%+</div>
                </div>
                <div className="text-right text-xs text-[#326273]/60">Volume discounts available</div>
              </div>
            </div>
            <div className="rounded-xl border border-[#326273]/10 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#326273]/60">Settlement Speed</div>
                  <div className="text-2xl font-extrabold text-[#E39774]">400ms</div>
                </div>
                <div className="text-right text-xs text-[#326273]/60">On-chain finality</div>
              </div>
            </div>
            <div className="rounded-xl border border-[#326273]/10 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#326273]/60">Yield on Deposits</div>
                  <div className="text-2xl font-extrabold text-[#326273]">~5% APY</div>
                </div>
                <div className="text-right text-xs text-[#326273]/60">USDC treasury</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
