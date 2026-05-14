'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { adminConsolePath } from '@/lib/admin-routing';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('staff@splash.finance');
  const [password, setPassword] = useState('splash-admin-demo');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json() as { error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? 'Invalid staff credentials');
      }

      toast.success('Staff session started');
      router.replace(adminConsolePath('/', window.location.hostname));
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Admin login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#1f4350] lg:grid-cols-[1fr_0.9fr]">
      <section className="relative hidden overflow-hidden p-10 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(92,158,173,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(227,151,116,0.28),transparent_30%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between rounded-[2rem] border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3">
            <Image src="/splash-logo.png" alt="Splash" width={42} height={42} className="h-10 w-10 brightness-0 invert" unoptimized />
            <div>
              <div className="text-2xl font-bold">Splash Staff</div>
              <div className="text-xs uppercase tracking-[0.24em] text-white/60">admin.splash.xyz</div>
            </div>
          </div>
          <div>
            <div className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#A7D6DF]">Operations Console</div>
            <h1 className="max-w-xl text-5xl font-black leading-tight tracking-[-0.04em]">Manual compliance and customer care workspace.</h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-white/70">Review KYB cases, capture approval rationale, and respond to feedback or complaints without mixing staff tools into the customer dashboard.</p>
          </div>
          <div className="grid gap-3 text-sm md:grid-cols-3">
            {['KYB review', 'Complaint triage', 'Audit trail'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 font-semibold text-white/80">
                <ShieldCheck className="mb-3 h-5 w-5 text-[#A7D6DF]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={login} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#F6F0ED] p-8 shadow-2xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#5C9EAD]">Staff only</div>
              <h2 className="mt-2 text-3xl font-black text-[#326273]">Admin login</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#326273] text-white">
              <LockKeyhole className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-[#326273]">
              Staff email
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="mt-2 w-full rounded-xl border border-[#326273]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#5C9EAD]" required />
            </label>
            <label className="block text-sm font-bold text-[#326273]">
              Password
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="mt-2 w-full rounded-xl border border-[#326273]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#5C9EAD]" required />
            </label>
          </div>

          <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E39774] px-4 py-3 font-bold text-white transition hover:bg-[#cd825f] disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enter staff console
          </button>

          <div className="mt-5 rounded-xl border border-[#5C9EAD]/20 bg-[#5C9EAD]/10 p-4 text-xs leading-5 text-[#326273]/70">
            Demo credentials are prefilled. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` before using this outside local testing.
          </div>
        </form>
      </section>
    </main>
  );
}
