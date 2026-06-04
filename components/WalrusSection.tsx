'use client';

import { motion } from 'framer-motion';
import { Database, FileText, BarChart3, ShieldCheck, Key } from 'lucide-react';
import { WalrusLogo, SuiLogo } from '@/components/BrandLogos';
import AmbientBackground from '@/components/AmbientBackground';

const features = [
  {
    icon: FileText,
    title: 'Invoice Storage',
    desc: 'Upload PDF invoices. Splash AI extracts payment data. The PDF is Seal-encrypted with your key and stored permanently on Walrus. Splash cannot read it after extraction — only you can.',
    tag: 'Seal-encrypted',
    color: '#0284C7',
  },
  {
    icon: BarChart3,
    title: 'Daily Audit Batches',
    desc: 'Every 24 hours, all settlement events are hashed into a Merkle tree, encrypted, and uploaded to Walrus. The root is anchored on Sui as an immutable AuditAnchor object.',
    tag: 'Merkle anchored',
    color: '#E39774',
  },
  {
    icon: ShieldCheck,
    title: 'Regulator-Verifiable',
    desc: 'Any auditor with the decryption key can verify every transaction against the on-chain Merkle root. Tamper-evident by design — the AuditAnchor on Sui is frozen and cannot be altered.',
    tag: 'AuditAnchor on Sui',
    color: '#5C9EAD',
  },
];

export default function WalrusSection() {
  return (
    <section id="walrus" className="relative overflow-hidden splash-page-bg py-16">
      <AmbientBackground variant="indigo" sheen />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#326273]/15 to-transparent" />
      <div className="container mx-auto px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <WalrusLogo size={36} />
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0284C7]/20 bg-[#0284C7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0284C7]">
                <Database className="h-3.5 w-3.5" />
                Powered by Walrus
              </div>
            </div>
            <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#1F4452] md:text-5xl">
              Your data is yours. <br />
              <span className="text-[#5C9EAD]">Permanently.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#326273]/75">
              Walrus is Sui&apos;s decentralized storage layer. Splash uses it for two critical workflows: invoice storage and daily compliance anchoring. Every blob is Seal-encrypted and pinned for 7 years.
            </p>

            <div className="mt-8 space-y-4">
              {features.map(({ icon: Icon, title, desc, tag, color }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex gap-4 rounded-2xl border border-[#326273]/10 bg-white/75 p-4 shadow-sm"
                >
                  <div
                    className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#1F4452]">{title}</h3>
                      <span className="rounded-full border border-[#326273]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
                        {tag}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-[#326273]/70">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="rounded-3xl border border-[#326273]/10 bg-[#1F4452] p-6 text-[#F6F0ED] shadow-2xl">
              <div className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-[#E39774]">
                Walrus audit flow
              </div>

              <div className="space-y-3">
                {[
                  { step: '1', label: 'Collect events', detail: 'All audit logs for the day' },
                  { step: '2', label: 'Build Merkle tree', detail: 'Hash each event + compute root' },
                  { step: '3', label: 'Seal-encrypt batch', detail: 'OPS_KEY + AUDITOR_KEY' },
                  { step: '4', label: 'Store on Walrus', detail: '7-year retention · immutable' },
                  { step: '5', label: 'Anchor on Sui', detail: 'AuditAnchor object · frozen' },
                ].map(({ step, label, detail }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-xs font-bold text-[#E39774]">
                      {step}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{label}</div>
                      <div className="text-xs text-white/50">{detail}</div>
                    </div>
                    {step === '4' && <WalrusLogo size={20} />}
                    {step === '5' && <SuiLogo size={20} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#326273]/10 bg-white/75 p-5 shadow-lg">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <Key className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1F4452]">Seal encryption</h3>
                  <p className="text-xs text-[#6E8A95]">Sui&apos;s identity-based encryption</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-[#326273]/70">
                Invoice PDFs are encrypted with Seal using your wallet key. Splash extracts invoice data during upload but cannot decrypt the stored blob. The ciphertext on Walrus is yours alone.
              </p>
              <div className="mt-3 rounded-xl bg-[#F6F0ED] p-3 font-mono text-xs text-[#326273]/60">
                <span className="text-green-600">✓</span> Splash: can extract → stores encrypted blob<br />
                <span className="text-green-600">✓</span> You: hold decryption key forever<br />
                <span className="text-green-600">✓</span> Auditor: verify against Merkle root on Sui
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#326273]/10 bg-white shadow-lg">
              <div className="border-b border-[#326273]/10 bg-[#F6F0ED] px-5 py-3">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#6E8A95]">Storage specification</div>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { label: 'Retention', value: '7 years (minimum)', mono: false },
                    { label: 'Replication', value: '100+ Walrus storage nodes', mono: false },
                    { label: 'Encryption', value: 'Seal (identity-based)', mono: true },
                    { label: 'Audit cadence', value: 'Daily Merkle root', mono: false },
                    { label: 'Anchor object', value: 'AuditAnchor on Sui', mono: true },
                    { label: 'Verification', value: 'On-chain · permissionless', mono: false },
                    { label: 'Erasure coding', value: 'Red Stuff (2D)', mono: true },
                  ].map(({ label, value, mono }) => (
                    <tr key={label} className="border-b border-[#326273]/10 last:border-0">
                      <td className="px-5 py-2.5 text-xs font-semibold text-[#326273]/70">{label}</td>
                      <td className={`px-5 py-2.5 text-right text-xs ${mono ? 'font-mono text-[#0284C7]' : 'font-semibold text-[#1F4452]'}`}>
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#0284C7]/20 bg-[#0284C7]/5 p-4 text-center">
                <div className="font-mono text-2xl font-bold text-[#0284C7]">7 yrs</div>
                <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#6E8A95]">min retention</div>
              </div>
              <div className="rounded-2xl border border-[#5C9EAD]/20 bg-[#5C9EAD]/5 p-4 text-center">
                <div className="font-mono text-2xl font-bold text-[#5C9EAD]">100%</div>
                <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#6E8A95]">on-chain verifiable</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
