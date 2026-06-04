import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingCTA() {
  return (
    <section className="relative overflow-hidden splash-page-bg px-6 py-16">
      <div className="absolute inset-x-0 top-1/2 h-64 -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(92,158,173,0.16),transparent_65%)]" />
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[#326273]/10 bg-[#1F4452] p-8 text-[#F6F0ED] shadow-2xl shadow-[#326273]/20 md:p-12">
        <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#5C9EAD]/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 translate-y-1/2 rounded-full bg-[#E39774]/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#E39774]">Ready to clear capital?</div>
            <h2 className="max-w-3xl text-4xl font-extrabold tracking-[-0.03em] text-white md:text-5xl">Join the settlement network built for Southeast Asia.</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">Log in to manage KYB, configure corridors, and launch governed B2B payouts from one treasury console.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link href="/login" className="inline-flex h-[53px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#5C9EAD] px-6 text-base font-medium text-white shadow-lg shadow-[#5C9EAD]/25 transition-all hover:-translate-y-0.5 hover:bg-[#4A8895]">
              Log in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
