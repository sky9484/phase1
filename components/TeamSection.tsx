'use client';

import { motion } from 'framer-motion';
import { Link, Mail } from 'lucide-react';

const team = [
  {
    name: 'Alex Chen',
    role: 'CEO & Co-Founder',
    image: '👨‍💼',
    bio: 'Former Goldman Sachs FX trader. Built cross-border payment infrastructure at a major SEA bank.',
    social: { linkedin: '#', twitter: '#', github: '#', email: '#' },
  },
  {
    name: 'Sarah Kim',
    role: 'CTO & Co-Founder',
    image: '👩‍💻',
    bio: 'Ex-Meta blockchain engineer. Led Sui ecosystem development and DeFi protocol design.',
    social: { linkedin: '#', twitter: '#', github: '#', email: '#' },
  },
  {
    name: 'David Lee',
    role: 'Head of Engineering',
    image: '👨‍🔬',
    bio: 'Former Google Cloud architect. Expert in distributed systems and high-frequency trading platforms.',
    social: { linkedin: '#', twitter: '#', github: '#', email: '#' },
  },
  {
    name: 'Maria Santos',
    role: 'Lead Protocol Engineer',
    image: '👩‍🔬',
    bio: 'Move language specialist. Contributed to core Sui protocol and smart contract security.',
    social: { linkedin: '#', twitter: '#', github: '#', email: '#' },
  },
  {
    name: 'James Wong',
    role: 'Senior Frontend Engineer',
    image: '👨‍🎨',
    bio: 'React and Next.js expert. Built UI for multiple fintech unicorns in Southeast Asia.',
    social: { linkedin: '#', twitter: '#', github: '#', email: '#' },
  },
  {
    name: 'Priya Patel',
    role: 'Compliance & Security Lead',
    image: '👩‍⚖️',
    bio: 'Former AML officer at DBS. Expert in cross-border regulatory frameworks and KYB/KYC.',
    social: { linkedin: '#', twitter: '#', github: '#', email: '#' },
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="bg-[#F6F0ED] py-24">
      <div className="container mx-auto px-6">
        <div className="mb-12 max-w-2xl">
          <h2 className="mb-3 text-4xl font-extrabold text-[#326273]">Built by experts in cross-border finance.</h2>
          <p className="text-[#326273]/70">Our team combines deep experience in traditional banking, blockchain, and regulatory compliance.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F6F0ED] text-4xl">
                  {member.image}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#326273]">{member.name}</h3>
                  <p className="text-sm font-semibold text-[#5C9EAD]">{member.role}</p>
                </div>
              </div>

              <p className="mb-4 text-sm text-[#326273]/70">{member.bio}</p>

              <div className="flex gap-2">
                <a
                  href={member.social.linkedin}
                  className="rounded-lg border border-[#326273]/10 bg-[#F6F0ED] px-3 py-2 text-xs font-semibold text-[#326273]/60 transition-colors hover:border-[#5C9EAD] hover:text-[#5C9EAD]"
                >
                  LinkedIn
                </a>
                <a
                  href={member.social.twitter}
                  className="rounded-lg border border-[#326273]/10 bg-[#F6F0ED] px-3 py-2 text-xs font-semibold text-[#326273]/60 transition-colors hover:border-[#5C9EAD] hover:text-[#5C9EAD]"
                >
                  Twitter
                </a>
                <a
                  href={member.social.github}
                  className="rounded-lg border border-[#326273]/10 bg-[#F6F0ED] px-3 py-2 text-xs font-semibold text-[#326273]/60 transition-colors hover:border-[#5C9EAD] hover:text-[#5C9EAD]"
                >
                  GitHub
                </a>
                <a
                  href={member.social.email}
                  className="rounded-lg border border-[#326273]/10 bg-[#F6F0ED] p-2 text-[#326273]/60 transition-colors hover:border-[#5C9EAD] hover:text-[#5C9EAD]"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[#5C9EAD]/20 bg-[#5C9EAD]/5 p-8 text-center">
          <h3 className="mb-2 text-2xl font-bold text-[#326273]">Join our team</h3>
          <p className="mb-4 text-[#326273]/70">We're hiring engineers, protocol developers, and compliance specialists.</p>
          <a
            href="mailto:careers@splash.finance"
            className="inline-flex items-center gap-2 rounded-xl bg-[#5C9EAD] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#4A8895]"
          >
            View open positions
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 8 L13 8 M9 4 L13 8 L9 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
