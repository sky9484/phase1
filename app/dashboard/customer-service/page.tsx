'use client';

import { useState } from 'react';
import { Headphones, Send, Bug, MessageSquareWarning, MessageSquare, Mail, Phone, Clock3, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const issueTypes = [
  { id: 'bug', label: 'Bug Report', icon: Bug, desc: 'Something is not working correctly' },
  { id: 'feature', label: 'Feature Request', icon: MessageSquare, desc: 'Suggest a new feature' },
  { id: 'complaint', label: 'Complaint', icon: MessageSquareWarning, desc: 'Report a problem or concern' },
  { id: 'other', label: 'Other', icon: Headphones, desc: 'General inquiry' },
];

const faqs = [
  { question: 'How long until my transfer settles?', answer: 'Most corridors clear within 3–5 minutes. The SLA target is under 10 minutes.' },
  { question: 'How do I authorize a batch payout?', answer: 'Upload a CSV in Batch Payout, review preflight, then confirm with your TOTP.' },
  { question: 'Where are receipts stored?', answer: 'Receipts are sealed on Sui and downloadable as PDF for your records.' },
];

const channels = [
  { icon: Mail, label: 'support@splash.finance', detail: 'Email · 24h response SLA' },
  { icon: Phone, label: '+60 3-1234 5678', detail: 'Mon–Fri · 9am–6pm MYT' },
  { icon: Clock3, label: 'Status: Operational', detail: 'All systems green' },
];

export default function CustomerServicePage() {
  const [type, setType] = useState('bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    if (!subject || !message) {
      toast.error('Subject and message are required');
      return;
    }
    setSubmitted(true);
    toast.success('Ticket submitted successfully. We will respond within 24 hours.');
  }

  function reset() {
    setType('bug');
    setSubject('');
    setMessage('');
    setEmail('');
    setSubmitted(false);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-1 inline-flex rounded-full bg-[#5C9EAD]/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#5C9EAD]">Support</div>
          <h1 className="text-2xl font-extrabold text-[#326273]">Customer Service</h1>
          <p className="mt-0.5 text-xs text-[#326273]/60">Submit issues, bugs, or complaints. We aim to respond within 24 hours.</p>
        </div>
        <div className="rounded-xl border border-[#326273]/10 bg-white px-3 py-2 text-xs font-semibold text-[#326273]">
          Tickets · Avg first reply &lt; 6h
        </div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div>
          {submitted ? (
            <div className="rounded-2xl border border-[#5C9EAD]/20 bg-[#5C9EAD]/5 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#5C9EAD]/10 text-[#5C9EAD]">
                <Send className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-[#326273]">Ticket Submitted</h2>
              <p className="mt-1 text-sm text-[#326273]/60">Your support request has been received. A confirmation email will be sent shortly.</p>
              <button onClick={reset} className="mt-5 rounded-lg bg-[#5C9EAD] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#4A8B9A]">
                Submit another
              </button>
            </div>
          ) : (
            <div className="space-y-5 rounded-2xl border border-[#326273]/10 bg-white p-6">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {issueTypes.map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setType(id)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      type === id
                        ? 'border-[#5C9EAD] bg-[#5C9EAD]/10'
                        : 'border-[#326273]/10 bg-white hover:border-[#5C9EAD]/30'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${type === id ? 'text-[#5C9EAD]' : 'text-[#326273]/50'}`} />
                    <div className={`mt-1.5 text-xs font-bold ${type === id ? 'text-[#326273]' : 'text-[#326273]/70'}`}>{label}</div>
                    <div className="mt-0.5 text-[10px] text-[#326273]/50 leading-tight">{desc}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-[#326273]/70">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                  className="mt-1 w-full rounded-lg border border-[#326273]/20 bg-[#F6F0ED] px-4 py-3 text-sm text-[#326273] focus:border-[#5C9EAD] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#326273]/70">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="mt-1 w-full rounded-lg border border-[#326273]/20 bg-[#F6F0ED] px-4 py-3 text-sm text-[#326273] focus:border-[#5C9EAD] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#326273]/70">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={6}
                  className="mt-1 w-full resize-none rounded-lg border border-[#326273]/20 bg-[#F6F0ED] px-4 py-3 text-sm text-[#326273] focus:border-[#5C9EAD] focus:outline-none"
                />
              </div>

              <button
                onClick={submit}
                className="w-full rounded-lg bg-[#5C9EAD] px-4 py-3 font-bold text-white hover:bg-[#4A8B9A]"
              >
                Submit Ticket
              </button>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#326273]/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#326273]">Get in touch</h2>
                <p className="mt-0.5 text-[11px] text-[#326273]/60">Direct channels to reach Splash support.</p>
              </div>
              <Headphones className="text-[#5C9EAD]" size={16} />
            </div>
            <div className="mt-3 space-y-2">
              {channels.map(({ icon: Icon, label, detail }) => (
                <div key={label} className="flex items-start gap-3 rounded-lg bg-[#F6F0ED] p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#5C9EAD]/10 text-[#5C9EAD]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-[#326273]">{label}</div>
                    <div className="mt-0.5 text-[11px] text-[#326273]/60">{detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#326273]/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#326273]">Common questions</h2>
                <p className="mt-0.5 text-[11px] text-[#326273]/60">Quick answers before you raise a ticket.</p>
              </div>
              <BookOpen className="text-[#5C9EAD]" size={16} />
            </div>
            <div className="mt-3 space-y-2">
              {faqs.map((item) => (
                <details key={item.question} className="group rounded-lg bg-[#F6F0ED] p-3 text-xs text-[#326273] open:bg-[#5C9EAD]/10">
                  <summary className="cursor-pointer list-none font-semibold marker:hidden">
                    {item.question}
                  </summary>
                  <p className="mt-2 text-[11px] leading-5 text-[#326273]/70">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E39774]/30 bg-[#E39774]/10 p-4 text-xs text-[#326273]/75">
            <div className="font-bold uppercase tracking-[0.16em] text-[#E39774]">Priority support</div>
            <p className="mt-2 leading-5">
              Tier 1 KYB-approved customers get priority response. Mention your Splash organization ID in the message for fastest routing.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
