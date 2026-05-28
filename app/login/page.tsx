"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import LoginSeaBackground from "@/components/login/LoginSeaBackground";
import FounderQuote from "@/components/login/FounderQuote";
import SplashLoading from "@/components/SplashLoading";

// ─── Marketing copy ──────────────────────────────────────────────────────────

const HERO_STATS = [
  { label: "Processed", value: "$40M+", caption: "across 14 corridors" },
  { label: "Avg. fee",  value: "0.80%", caption: "blended on USD→APAC" },
  { label: "Settles in", value: "4.2 min", caption: "median end-to-end" },
];

const TRUST_BADGES = [
  { label: "KYB verified",      sub: "Sumsub Tier 1" },
  { label: "AML / KYT",         sub: "Live screening" },
  { label: "Audit-anchored",    sub: "7-yr Walrus retention" },
];

const DEMO = {
  email:    "demo@splash.finance",
  password: "Demo@12345",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 6 && !isSubmitting;

  async function authorizeAndRedirect(label: string) {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    toast.success(label);
    setAuthorizing(true);
    await new Promise((r) => setTimeout(r, 850));
    router.push("/dashboard");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      toast.error("Enter your business email and password to continue.");
      return;
    }
    await authorizeAndRedirect("Signed in securely");
  }

  function onSso(provider: "Google" | "Microsoft") {
    if (isSubmitting) return;
    toast.message(`${provider} SSO — demo mode`, { description: "Routing you to the dashboard." });
    void authorizeAndRedirect(`Signed in with ${provider}`);
  }

  function fillDemo() {
    setEmail(DEMO.email);
    setPassword(DEMO.password);
    toast.success("Demo credentials filled — press Sign in.");
  }

  if (authorizing) return <SplashLoading label="Securing your session" />;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 text-[#326273] sm:px-6 sm:py-8">
      <LoginSeaBackground />

      {/* ── Top-left home link ───────────────────────────────────────────── */}
      <Link
        href="/"
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/15 px-3 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/25 sm:left-6 sm:top-6 sm:text-sm"
      >
        <Image
          src="/splash-logo.png"
          alt="Splash"
          width={32}
          height={32}
          className="h-7 w-7 rounded-xl object-contain sm:h-8 sm:w-8"
          priority
          unoptimized
        />
        Splash
      </Link>

      {/* ── Top-right status pill ────────────────────────────────────────── */}
      <div className="absolute right-4 top-4 z-10 hidden items-center gap-2 rounded-2xl border border-white/15 bg-white/12 px-3 py-1.5 text-[11px] font-semibold text-white/90 backdrop-blur sm:right-6 sm:top-6 sm:flex">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        All systems operational
      </div>

      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 mt-14 grid w-full max-w-[1040px] overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl shadow-[#0c2632]/35 backdrop-blur-xl sm:mt-0 lg:grid-cols-[1.05fr_1fr]"
      >
        {/* ─── Left: brand panel ────────────────────────────────────────── */}
        <aside className="relative overflow-hidden bg-[#1F4452] p-6 text-[#F6F0ED] sm:p-7 lg:p-8">
          {/* ambient blobs */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#5C9EAD]/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-[#E39774]/20 blur-3xl" />

          <div className="relative flex min-h-[460px] flex-col justify-between gap-6">
            {/* Brand badge */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E39774]">
                <Sparkles className="h-3 w-3" />
                Business banking · APAC + global
              </div>

              <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.025em] text-white sm:text-[30px] lg:text-[32px]">
                Move money like
                <br />
                modern teams do.
              </h1>
              <p className="mt-3 max-w-sm text-[13px] leading-6 text-white/70">
                One platform for batch payouts, treasury yield, and real-time corridor
                rates — built for finance teams that ship.
              </p>

              {/* Stat strip */}
              <div className="mt-6 grid grid-cols-3 gap-2.5">
                {HERO_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-sm"
                  >
                    <div className="font-mono text-lg font-extrabold text-[#E39774] sm:text-xl">
                      {s.value}
                    </div>
                    <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/55">
                      {s.label}
                    </div>
                    <div className="mt-1 text-[10px] leading-snug text-white/45">
                      {s.caption}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust badges */}
              <div className="mt-6 space-y-2">
                {TRUST_BADGES.map((b) => (
                  <div
                    key={b.label}
                    className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#5C9EAD]/20">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#5C9EAD]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-white leading-none">
                        {b.label}
                      </div>
                      <div className="mt-1 text-[10px] text-white/50 leading-none">
                        {b.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <FounderQuote />
          </div>
        </aside>

        {/* ─── Right: sign-in form ──────────────────────────────────────── */}
        <section className="bg-white p-6 sm:p-7 lg:p-8">
          <div className="mx-auto flex h-full max-w-md flex-col">
            {/* Form header */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#5C9EAD] to-[#326273] text-white shadow-md shadow-[#326273]/20">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-[20px] font-extrabold leading-none tracking-[-0.02em] text-[#1F4452]">
                    Welcome back
                  </h2>
                  <p className="mt-1.5 text-[11px] leading-none text-[#326273]/60">
                    Sign in to your business workspace
                  </p>
                </div>
              </div>
            </div>

            {/* SSO buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onSso("Google")}
                className="group flex items-center justify-center gap-2 rounded-xl border border-[#326273]/12 bg-white px-3 py-2.5 text-xs font-semibold text-[#1F4452] transition-all hover:border-[#5C9EAD]/40 hover:bg-[#F6F0ED]/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <GoogleIcon className="h-4 w-4" />
                Google
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onSso("Microsoft")}
                className="group flex items-center justify-center gap-2 rounded-xl border border-[#326273]/12 bg-white px-3 py-2.5 text-xs font-semibold text-[#1F4452] transition-all hover:border-[#5C9EAD]/40 hover:bg-[#F6F0ED]/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MicrosoftIcon className="h-4 w-4" />
                Microsoft
              </button>
            </div>

            {/* Divider */}
            <div className="my-1 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#326273]/35">
              <div className="h-px flex-1 bg-[#326273]/12" />
              or with email
              <div className="h-px flex-1 bg-[#326273]/12" />
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="mt-3 space-y-3">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="ml-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#326273]/55"
                >
                  Work email
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#326273]/40" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-[#326273]/12 bg-[#FAF6F3] py-2.5 pl-10 pr-4 text-sm font-medium text-[#1F4452] outline-none transition-all placeholder:font-normal placeholder:text-[#326273]/35 focus:border-[#5C9EAD]/55 focus:bg-white focus:ring-4 focus:ring-[#5C9EAD]/15"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="ml-1 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#326273]/55"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-bold text-[#5C9EAD] transition-colors hover:text-[#326273]"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#326273]/40" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-[#326273]/12 bg-[#FAF6F3] py-2.5 pl-10 pr-12 text-sm font-medium text-[#1F4452] outline-none transition-all placeholder:font-normal placeholder:text-[#326273]/35 focus:border-[#5C9EAD]/55 focus:bg-white focus:ring-4 focus:ring-[#5C9EAD]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#326273]/45 transition-colors hover:text-[#326273]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <label className="flex cursor-pointer items-center gap-2 pt-1 text-[11px] font-medium text-[#326273]/70">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-[#326273]/25 text-[#5C9EAD] focus:ring-[#5C9EAD]"
                />
                Trust this device for 30 days
              </label>

              {/* Sign in button */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="group mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#326273] to-[#1F4452] px-6 text-sm font-bold text-white shadow-lg shadow-[#1F4452]/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#1F4452]/30 active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
                {!isSubmitting && (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </form>

            {/* Demo account */}
            <div className="mt-4 rounded-xl border border-[#5C9EAD]/20 bg-gradient-to-br from-[#5C9EAD]/8 to-[#E39774]/5 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[#5C9EAD]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#326273]/75">
                    Try the demo
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="rounded-lg bg-[#326273] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:bg-[#264e5b]"
                >
                  Fill
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1 text-[11px] sm:grid-cols-2">
                <div className="flex items-center justify-between gap-2 rounded-lg bg-white/80 px-2 py-1.5">
                  <span className="text-[#326273]/55">Email</span>
                  <span className="truncate font-mono font-semibold text-[#1F4452]">
                    {DEMO.email}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-white/80 px-2 py-1.5">
                  <span className="text-[#326273]/55">Pass</span>
                  <span className="font-mono font-semibold text-[#1F4452]">
                    {DEMO.password}
                  </span>
                </div>
              </div>
            </div>

            {/* Sign up + legal */}
            <div className="mt-4 space-y-2 text-center">
              <p className="text-[12px] text-[#326273]/70">
                New to Splash?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-[#5C9EAD] transition-colors hover:text-[#326273]"
                >
                  Open a business account
                </Link>
              </p>
              <p className="text-[10px] text-[#326273]/40">
                Protected by reCAPTCHA · Read our{" "}
                <Link href="#" className="underline hover:text-[#326273]/65">Privacy</Link>
                {" "}&amp;{" "}
                <Link href="#" className="underline hover:text-[#326273]/65">Terms</Link>
              </p>
            </div>
          </div>
        </section>
      </motion.section>
    </main>
  );
}

// ─── SSO brand icons ─────────────────────────────────────────────────────────

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

function MicrosoftIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#F25022" d="M1 1h10v10H1z"/>
      <path fill="#7FBA00" d="M13 1h10v10H13z"/>
      <path fill="#00A4EF" d="M1 13h10v10H1z"/>
      <path fill="#FFB900" d="M13 13h10v10H13z"/>
    </svg>
  );
}
