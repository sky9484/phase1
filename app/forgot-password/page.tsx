'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import IsometricAuthShell from '@/components/auth/IsometricAuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitting(false);
    setSent(true);
    toast.success('Reset link sent');
  }

  return (
    <IsometricAuthShell
      eyebrow="Account recovery"
      title={sent ? 'Check your inbox.' : 'Reset your password.'}
      description={sent
        ? `We sent password recovery instructions to ${email}.`
        : 'Enter your business email and we will send a secure recovery link.'}
      art="/isometric/treasury.svg"
      artAlt="Isometric smart treasury"
      visualTitle="Secure by default"
      visualCopy="Recover access without compromising your treasury."
    >
      {sent ? (
        <section className="iso-auth-success">
          <CheckCircle2 aria-hidden="true" />
          <h2>Recovery email sent</h2>
          <p>The link expires in 30 minutes. Check spam or request another email if it does not arrive.</p>
          <button type="button" onClick={() => setSent(false)}>
            <ArrowLeft aria-hidden="true" /> Use another email
          </button>
        </section>
      ) : (
        <form onSubmit={onSubmit} className="iso-auth-form">
          <label className="iso-auth-field" htmlFor="recovery-email">
            <span>Business email</span>
            <div>
              <Mail aria-hidden="true" />
              <input
                id="recovery-email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </label>
          <button type="submit" disabled={!email.includes('@') || submitting} className="iso-auth-submit">
            {submitting ? 'Sending reset link...' : 'Send secure reset link'}
            {!submitting ? <ArrowRight aria-hidden="true" /> : null}
          </button>
        </form>
      )}

      <div className="iso-auth-help">
        <strong>Still locked out?</strong>
        <span>Contact support after verifying your business identity.</span>
      </div>

      <p className="iso-auth-switch">
        Remembered your password? <Link href="/login">Back to sign in</Link>
      </p>
    </IsometricAuthShell>
  );
}
