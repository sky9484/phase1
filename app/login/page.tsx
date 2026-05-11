"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Building2, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

const proofItems = [
  { label: "Settlement speed", value: "400ms" },
  { label: "Corridor uptime", value: "99.997%" },
  { label: "Active corridors", value: "14" },
];

const securityItems = [
  "KYB-verified business access",
  "AML/KYT controls before authorization",
  "Signed receipts and audit trails",
];

const demoAccount = {
  email: "demo@splash.finance",
  password: "Demo@12345",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 6 && !isSubmitting;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      toast.error("Enter your business email and password.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Signed in securely");
    router.push("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F6F0ED] px-6 py-10 text-[#326273]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(92,158,173,0.18),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(227,151,116,0.16),transparent_28%),linear-gradient(180deg,#F6F0ED_0%,#F6F0ED_58%,#ECDED7_100%)]" />
      <div className="absolute left-8 top-8 z-10">
        <Link href="/" className="inline-flex items-center gap-2 rounded-2xl border border-[#326273]/10 bg-white/60 px-3 py-2 text-sm font-semibold text-[#1F4452] shadow-sm backdrop-blur transition-colors hover:bg-white">
          <Image src="/splash-logo.png" alt="Splash" width={36} height={36} className="h-9 w-9 rounded-xl object-contain" priority unoptimized />
          Splash
        </Link>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#326273]/10 bg-white/75 shadow-2xl shadow-[#326273]/10 backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]"
      >
        <aside className="relative overflow-hidden bg-[#1F4452] p-8 text-[#F6F0ED] md:p-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#5C9EAD]/30 blur-3xl" />
          <div className="absolute -bottom-24 left-16 h-64 w-64 rounded-full bg-[#E39774]/20 blur-3xl" />

          <div className="relative flex min-h-[520px] flex-col justify-between">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#E39774]">
                <Sparkles className="h-3.5 w-3.5" />
                Business console
              </div>
              <h1 className="max-w-md text-4xl font-extrabold tracking-[-0.035em] text-white md:text-5xl">
                Access your settlement command center.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-white/70">
                Sign in to manage batch payouts, monitor corridors, review compliance posture, and authorize treasury movements.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {proofItems.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <div className="font-mono text-2xl font-semibold text-[#E39774]">{item.value}</div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-white/50">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 space-y-4">
              {securityItems.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-medium text-white/75">
                  <BadgeCheck className="h-5 w-5 text-[#5C9EAD]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="p-8 md:p-10 lg:p-12">
          <div className="mx-auto flex h-full max-w-md flex-col justify-center">
            <div className="mb-8">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5C9EAD] text-white shadow-lg shadow-[#5C9EAD]/25">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-[#1F4452]">Sign in to Splash</h2>
              <p className="mt-2 text-sm leading-6 text-[#326273]/65">Use your business email to continue to the treasury dashboard.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="ml-1 text-xs font-bold uppercase tracking-wider text-[#326273]/50">
                  Business email
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C9EAD]" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-[#326273]/10 bg-[#F6F0ED]/60 py-3.5 pl-11 pr-4 text-[#1F4452] outline-none transition-all placeholder:text-[#326273]/35 focus:border-[#5C9EAD]/40 focus:ring-2 focus:ring-[#5C9EAD]/25"
                  />
                </div>
              </div>

              <div>
                <div className="ml-1 flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-[#326273]/50">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-bold text-[#5C9EAD] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C9EAD]" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-[#326273]/10 bg-[#F6F0ED]/60 py-3.5 pl-11 pr-12 text-[#1F4452] outline-none transition-all placeholder:text-[#326273]/35 focus:border-[#5C9EAD]/40 focus:ring-2 focus:ring-[#5C9EAD]/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E8A95] transition-colors hover:text-[#326273]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#326273]/70">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-4 w-4 rounded border-[#326273]/20 text-[#5C9EAD] focus:ring-[#5C9EAD]"
                  />
                  Remember this device
                </label>
                <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6E8A95] sm:flex">
                  <Building2 className="h-3.5 w-3.5" />
                  KYB gated
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="group flex h-[53px] w-full items-center justify-center gap-2 rounded-xl bg-[#326273] px-6 font-bold text-white shadow-lg shadow-[#326273]/20 transition-all hover:-translate-y-0.5 hover:bg-[#28536B] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-[#326273]/10 bg-[#F6F0ED]/70 p-4 text-sm text-[#326273]/70">
              New to Splash?{" "}
              <Link href="/signup" className="font-bold text-[#5C9EAD] hover:underline">
                Join the global network
              </Link>
              .
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#326273]/35">
              <ShieldCheck className="h-3 w-3" />
              Protected treasury access
            </div>

            <div className="mt-5 rounded-2xl border border-[#5C9EAD]/20 bg-[#5C9EAD]/10 p-4">
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#4A8895]">Demo account</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white/60 px-3 py-2">
                  <span className="text-[#326273]/60">Email</span>
                  <span className="font-mono font-semibold text-[#1F4452]">{demoAccount.email}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white/60 px-3 py-2">
                  <span className="text-[#326273]/60">Password</span>
                  <span className="font-mono font-semibold text-[#1F4452]">{demoAccount.password}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail(demoAccount.email);
                  setPassword(demoAccount.password);
                  toast.success("Demo credentials filled");
                }}
                className="mt-3 flex h-10 w-full items-center justify-center rounded-xl bg-[#5C9EAD] text-sm font-bold text-white transition-colors hover:bg-[#4A8895]"
              >
                Use demo credentials
              </button>
            </div>
          </div>
        </section>
      </motion.section>
    </main>
  );
}
