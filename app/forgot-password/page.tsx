'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSent(true);
    toast.success('Reset link sent');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6F0ED] p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#326273]/10 bg-white p-8 shadow-xl">
        <div className="mb-1 text-2xl font-extrabold text-[#326273]">Reset password</div>
        <p className="mb-6 text-sm text-[#326273]/60">We&apos;ll email you a reset link.</p>
        {sent ? (
          <div className="rounded-lg border border-[#5C9EAD]/30 bg-[#5C9EAD]/10 p-4 text-sm text-[#326273]">Check your inbox for the reset link.</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-[#326273]/20 bg-[#F6F0ED] px-4 py-3 text-[#326273] focus:border-[#5C9EAD] focus:outline-none"
            />
            <button className="w-full rounded-lg bg-[#326273] py-3 font-bold text-white shadow-sm transition-colors hover:bg-[#264e5b]">Send reset link</button>
          </form>
        )}
        <Link href="/login" className="mt-6 block text-sm text-[#5C9EAD] hover:underline">← Back to sign in</Link>
      </div>
    </main>
  );
}
