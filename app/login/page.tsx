"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import LoginSeaBackground from "@/components/login/LoginSeaBackground";
import FounderQuote from "@/components/login/FounderQuote";
import SplashLoading from "@/components/SplashLoading";

const proofItems = [
  { label: "Speed", value: "400ms" },
  { label: "Uptime", value: "99.997%" },
  { label: "Corridors", value: "14" },
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
  const [authorizing, setAuthorizing] = useState(false);

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
    setAuthorizing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    router.push("/dashboard");
  }

  if (authorizing) {
    return <SplashLoading label="Securing your session" />;
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 text-[#326273] sm:px-6 sm:py-8">
      <LoginSeaBackground />

      <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/15 px-3 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur transition-colors hover:bg-white/25 sm:text-sm"
        >
          <Image
            src="/splash-logo.png"
            alt="Splash"
            width={32}
            height={32}
            className="h-7 w-7 rounded-xl object-contain sm:h-9 sm:w-9"
            priority
            unoptimized
          />
          Splash
        </Link>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 mt-12 grid w-full max-w-[920px] overflow-hidden rounded-3xl border border-white/15 bg-white/90 shadow-2xl shadow-[#0c2632]/30 backdrop-blur-xl sm:mt-0 lg:grid-cols-[0.95fr_1.05fr]"
      >
        <aside className="relative overflow-hidden bg-[#1F4452] p-5 text-[#F6F0ED] sm:p-6 lg:p-7">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#5C9EAD]/30 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-[#E39774]/20 blur-3xl" />

          <div className="relative flex min-h-[420px] flex-col justify-between gap-5">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E39774]">
                <Sparkles className="h-3 w-3" />
                Business console
              </div>
              <h1 className="text-2xl font-extrabold tracking-[-0.025em] text-white sm:text-3xl lg:text-[2rem] lg:leading-[2.4rem]">
                Access your settlement command center.
              </h1>
              <p className="mt-3 text-xs leading-6 text-white/70 sm:text-sm">
                Manage batch payouts, monitor corridors, and authorize treasury moves.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {proofItems.map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/10 bg-white/10 p-2.5">
                    <div className="font-mono text-base font-bold text-[#E39774] sm:text-lg">{item.value}</div>
                    <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-white/50">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2">
                {securityItems.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-medium text-white/75">
                    <BadgeCheck className="h-4 w-4 shrink-0 text-[#5C9EAD]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <FounderQuote />
          </div>
        </aside>

        <section className="p-5 sm:p-6 lg:p-8">
          <div className="mx-auto flex h-full max-w-md flex-col justify-center">
            <div className="mb-5">
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5C9EAD] text-white shadow-md shadow-[#5C9EAD]/25">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#1F4452] sm:text-2xl">Sign in to Splash</h2>
              <p className="mt-1 text-xs leading-5 text-[#326273]/65">Use your business email to continue.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="email" className="ml-1 text-[10px] font-bold uppercase tracking-wider text-[#326273]/50">
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
                    className="w-full rounded-xl border border-[#326273]/10 bg-[#F6F0ED]/60 py-2.5 pl-11 pr-4 text-sm text-[#1F4452] outline-none transition-all placeholder:text-[#326273]/35 focus:border-[#5C9EAD]/40 focus:ring-2 focus:ring-[#5C9EAD]/25"
                  />
                </div>
              </div>

              <div>
                <div className="ml-1 flex items-center justify-between">
                  <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-[#326273]/50">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[11px] font-bold text-[#5C9EAD] hover:underline">
                    Forgot?
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
                    className="w-full rounded-xl border border-[#326273]/10 bg-[#F6F0ED]/60 py-2.5 pl-11 pr-12 text-sm text-[#1F4452] outline-none transition-all placeholder:text-[#326273]/35 focus:border-[#5C9EAD]/40 focus:ring-2 focus:ring-[#5C9EAD]/25"
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

              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#326273]/70">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-3.5 w-3.5 rounded border-[#326273]/20 text-[#5C9EAD] focus:ring-[#5C9EAD]"
                />
                Remember this device
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#326273] px-6 text-sm font-bold text-white shadow-lg shadow-[#326273]/20 transition-all hover:-translate-y-0.5 hover:bg-[#28536B] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <div className="mt-4 rounded-xl border border-[#5C9EAD]/20 bg-[#5C9EAD]/10 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4A8895]">Demo account</div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(demoAccount.email);
                    setPassword(demoAccount.password);
                    toast.success("Demo credentials filled");
                  }}
                  className="rounded-md bg-[#5C9EAD] px-2.5 py-1 text-[10px] font-bold text-white transition-colors hover:bg-[#4A8895]"
                >
                  Fill
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1 text-[11px] sm:grid-cols-2">
                <div className="flex items-center justify-between gap-2 rounded-md bg-white/70 px-2 py-1.5">
                  <span className="text-[#326273]/60">Email</span>
                  <span className="truncate font-mono font-semibold text-[#1F4452]">{demoAccount.email}</span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-md bg-white/70 px-2 py-1.5">
                  <span className="text-[#326273]/60">Password</span>
                  <span className="font-mono font-semibold text-[#1F4452]">{demoAccount.password}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 text-center text-xs text-[#326273]/70">
              New to Splash?{" "}
              <Link href="/signup" className="font-bold text-[#5C9EAD] hover:underline">
                Join the global network
              </Link>
              .
            </div>
          </div>
        </section>
      </motion.section>
    </main>
  );
}
