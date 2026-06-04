"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, CheckCircle2, Lock, Mail } from "lucide-react";

const benefits = [
  "Instant Global Settlements",
  "0.8%+ Starting Fees",
  "Built-in KYB Compliance",
  "Zero Gas Fee Infrastructure",
];

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center splash-page-bg p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-[#326273]/10 bg-white shadow-xl shadow-[#326273]/5 md:grid-cols-2"
      >
        <div className="relative flex flex-col justify-between overflow-hidden bg-[#326273] p-10 text-white">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#5C9EAD] opacity-20 blur-3xl" />
          <div className="relative z-10">
            <h2 className="mb-6 text-3xl font-bold">
              Build your business on <span className="text-[#5C9EAD]">Splash</span>.
            </h2>
            <div className="space-y-6">
              {benefits.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#E39774]" />
                  <span className="font-medium text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 mt-10 font-mono text-xs text-white/40">SPLASH FINANCE // VERSION 1.0.4</div>
        </div>

        <div className="p-10">
          <h3 className="mb-2 text-2xl font-bold text-[#326273]">Create Account</h3>
          <p className="mb-8 text-sm text-[#326273]/60">Establish your business settlement profile.</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#326273]/50">Company Name</label>
              <div className="relative mt-1">
                <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C9EAD]" />
                <input
                  type="text"
                  placeholder="Acme Logistics Sdn Bhd"
                  autoComplete="organization"
                  className="w-full rounded-xl border border-[#326273]/10 bg-[#F6F0ED]/50 py-3 pl-11 pr-4 outline-none transition-all focus:ring-2 focus:ring-[#5C9EAD]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#326273]/50">Business Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C9EAD]" />
                <input
                  type="email"
                  placeholder="ceo@acme.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#326273]/10 bg-[#F6F0ED]/50 py-3 pl-11 pr-4 outline-none transition-all focus:ring-2 focus:ring-[#5C9EAD]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#326273]/50">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C9EAD]" />
                <input
                  type="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[#326273]/10 bg-[#F6F0ED]/50 py-3 pl-11 pr-4 outline-none transition-all focus:ring-2 focus:ring-[#5C9EAD]"
                />
              </div>
            </div>

            <Link
              href="/settings/kyb"
              className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E39774] py-4 font-bold text-white shadow-lg shadow-[#E39774]/20 transition-all hover:bg-[#d48563]"
            >
              Register Business
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <p className="mt-4 text-center text-sm text-[#326273]/60">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#5C9EAD] hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
