'use client';

import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import AmbientBackground from '@/components/AmbientBackground';

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

const team = [
  {
    name: 'Sky',
    role: 'Founder & CEO',
    initials: 'SK',
    bio: 'Ex-Citibank · Ex-Relationship Manager for JP Morgan. Built the original Splash thesis on cross-border B2B payments.',
    accent: '#5C9EAD',
  },
  {
    name: 'Sebastian',
    role: 'Senior Backend Engineer',
    initials: 'SB',
    bio: 'Ex-Google Malaysia. Distributed systems and high-throughput payment infrastructure.',
    accent: '#E39774',
  },
  {
    name: 'Jing Yuan',
    role: 'Fullstack Engineer',
    initials: 'JY',
    bio: '40+ global hackathon winner across every major chain. Ships full-stack product end-to-end.',
    accent: '#2B3A67',
  },
  {
    name: 'Liew Qi Jian',
    role: 'Smart Contract Engineer',
    initials: 'QJ',
    bio: '40+ hackathon winner · Move expert · Ex-Superteam University Lead. Owns the Sui Move stack.',
    accent: '#0284C7',
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="relative overflow-hidden splash-page-bg py-16">
      <AmbientBackground variant="teal" />
      <div className="container relative mx-auto px-6">
        <div className="mb-12 max-w-2xl">
          <h2 className="mb-3 text-4xl font-extrabold text-[#326273]">Built by experts in cross-border finance.</h2>
          <p className="text-[#326273]/70">A focused team combining deep experience in traditional banking, Sui Move engineering, and high-performance product delivery.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-[#326273]/10 bg-white p-6 transition-all hover:border-[#5C9EAD]/30 hover:shadow-lg hover:shadow-[#5C9EAD]/10"
            >
              <div className="mb-4 flex items-center gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-mono text-lg font-bold text-white shadow-lg"
                  style={{ backgroundColor: member.accent }}
                >
                  {member.initials}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#326273]">{member.name}</h3>
                  <p className="text-sm font-semibold" style={{ color: member.accent }}>{member.role}</p>
                </div>
              </div>

              <p className="mb-4 text-sm leading-6 text-[#326273]/70">{member.bio}</p>

              <div className="flex gap-2">
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#326273]/10 bg-[#F6F0ED] px-3 py-1.5 text-xs font-semibold text-[#326273]/65 transition-colors hover:border-[#5C9EAD] hover:text-[#5C9EAD]"
                >
                  <LinkedInIcon className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center rounded-lg border border-[#326273]/10 bg-[#F6F0ED] p-2 text-[#326273]/65 transition-colors hover:border-[#5C9EAD] hover:text-[#5C9EAD]"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
