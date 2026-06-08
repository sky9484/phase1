'use client';

import { useRef, useState } from 'react';
import DashboardPageLogo from '@/components/DashboardPageLogo';
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Lock,
  Search,
  Shield,
  Upload,
  XCircle,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft';
type FilterType    = 'all' | 'paid' | 'pending' | 'overdue' | 'draft';

type Invoice = {
  id: string;
  vendor: string;
  corridor: string;
  usdAmount: string;
  localAmount: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  walrusCid: string;
  sealEncrypted: boolean;
  anchorObjectId: string | null;
  purpose: string;
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-041', vendor: 'Manila BPO Group Inc.',
    corridor: 'USD→PHP', usdAmount: '$12,400.00', localAmount: 'PHP 699,608',
    date: '28 May 2026', dueDate: '30 May 2026', status: 'pending',
    walrusCid: 'walrus:blobId_7f3a9c1b2e4d5f6a', sealEncrypted: true,
    anchorObjectId: '0x4a3f...b92c', purpose: 'Payroll services',
  },
  {
    id: 'INV-2026-040', vendor: 'Jakarta Textile Exports PT',
    corridor: 'USD→IDR', usdAmount: '$8,500.00', localAmount: 'IDR 138.4M',
    date: '25 May 2026', dueDate: '25 May 2026', status: 'paid',
    walrusCid: 'walrus:blobId_2c8d4e1a9b3f7e6d', sealEncrypted: true,
    anchorObjectId: '0x9b1e...a37f', purpose: 'Vendor invoice',
  },
  {
    id: 'INV-2026-039', vendor: 'SG Marketplace Pte Ltd',
    corridor: 'USD→SGD', usdAmount: '$3,200.00', localAmount: 'SGD 4,304',
    date: '22 May 2026', dueDate: '22 May 2026', status: 'paid',
    walrusCid: 'walrus:blobId_5e9f2a1d7c4b8e3f', sealEncrypted: true,
    anchorObjectId: '0x2f7c...d84a', purpose: 'Service fee',
  },
  {
    id: 'INV-2026-038', vendor: 'Kuala Lumpur Trading Co.',
    corridor: 'USD→MYR', usdAmount: '$5,600.00', localAmount: 'MYR 26,376',
    date: '18 May 2026', dueDate: '20 May 2026', status: 'overdue',
    walrusCid: 'walrus:blobId_1b4c8f2e9a3d7e5c', sealEncrypted: true,
    anchorObjectId: null, purpose: 'Vendor invoice',
  },
  {
    id: 'INV-2026-037', vendor: 'Amsterdam Logistics BV',
    corridor: 'USD→EUR', usdAmount: '$2,800.00', localAmount: 'EUR 2,587',
    date: '15 May 2026', dueDate: '15 May 2026', status: 'paid',
    walrusCid: 'walrus:blobId_6d3a7c5b2f1e9d4a', sealEncrypted: true,
    anchorObjectId: '0x7d2a...f61b', purpose: 'Freight services',
  },
  {
    id: 'INV-2026-036', vendor: 'Bangkok Garments Co. Ltd',
    corridor: 'USD→THB', usdAmount: '$4,100.00', localAmount: 'THB 146,862',
    date: '12 May 2026', dueDate: '19 May 2026', status: 'paid',
    walrusCid: 'walrus:blobId_9a2e6d1b4c8f3a7e', sealEncrypted: true,
    anchorObjectId: '0x3e9f...c24d', purpose: 'Vendor invoice',
  },
  {
    id: 'INV-2026-035', vendor: 'Ho Chi Minh Supplies JSC',
    corridor: 'USD→VND', usdAmount: '$1,950.00', localAmount: 'VND 49.5M',
    date: '08 May 2026', dueDate: '08 May 2026', status: 'paid',
    walrusCid: 'walrus:blobId_3c7f1e5a9b2d4c8e', sealEncrypted: true,
    anchorObjectId: '0x5c1d...b93e', purpose: 'Service fee',
  },
  {
    id: 'INV-2026-034', vendor: 'London Fintech Partners Ltd',
    corridor: 'USD→GBP', usdAmount: '$6,400.00', localAmount: 'GBP 5,050',
    date: '04 May 2026', dueDate: '14 May 2026', status: 'draft',
    walrusCid: '', sealEncrypted: false,
    anchorObjectId: null, purpose: 'Consulting fee',
  },
];

// ─── Status map ───────────────────────────────────────────────────────────────

const STATUS_MAP: Record<InvoiceStatus, { label: string; cls: string; dot: string }> = {
  paid:    { label: 'Paid',    cls: 'bg-emerald-50 text-emerald-700',     dot: 'bg-emerald-500'   },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700',         dot: 'bg-amber-500'     },
  overdue: { label: 'Overdue', cls: 'bg-red-50 text-red-600',             dot: 'bg-red-500'       },
  draft:   { label: 'Draft',   cls: 'bg-[#326273]/8 text-[#326273]/60',   dot: 'bg-[#326273]/30' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: InvoiceStatus }) {
  const s = STATUS_MAP[status];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', s.cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
}

function WalrusBadge({ cid, anchored }: { cid: string; anchored: boolean }) {
  if (!cid) return <span className="text-[11px] text-[#326273]/30">Not uploaded</span>;
  return (
    <div className="flex items-center gap-1">
      <Database size={11} className={anchored ? 'text-[#5C9EAD]' : 'text-[#326273]/40'} />
      <span className="font-mono text-[10px] text-[#326273]/50">{cid.slice(0, 26)}…</span>
      {anchored && <CheckCircle2 size={11} className="text-emerald-500" />}
    </div>
  );
}

function UploadZone({ onUpload }: { onUpload: (name: string) => void }) {
  const inputRef    = useRef<HTMLInputElement>(null);
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done,      setDone]      = useState(false);

  function handle(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf')) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setDone(true);
      onUpload(file.name);
      setTimeout(() => setDone(false), 3200);
    }, 1800);
  }

  return (
    <div
      onDragOver={(e)  => { e.preventDefault(); setDragging(true); }}
      onDragLeave={()  => setDragging(false)}
      onDrop={(e)      => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
      onClick={()      => { if (!uploading) inputRef.current?.click(); }}
      className={cn(
        'relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all',
        dragging  ? 'border-emerald-400 bg-emerald-50' :
        uploading ? 'border-[#5C9EAD]/50 bg-[#5C9EAD]/5' :
        done      ? 'border-emerald-400 bg-emerald-50' :
                    'border-[#326273]/15 bg-[#F6F0ED] hover:border-[#5C9EAD]/40'
      )}
    >
      <input
        ref={inputRef} type="file" accept=".pdf" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = ''; }}
      />

      {uploading ? (
        <>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#5C9EAD]/15 animate-pulse">
            <Upload size={22} className="text-[#5C9EAD]" />
          </div>
          <p className="text-sm font-semibold text-[#326273]">Encrypting with Seal…</p>
          <p className="mt-1 text-xs text-[#326273]/50">Uploading to Walrus decentralised storage</p>
          <div className="mx-auto mt-3 h-1.5 w-40 overflow-hidden rounded-full bg-[#326273]/10">
            <div className="h-full w-3/4 animate-pulse rounded-full bg-[#5C9EAD]" />
          </div>
        </>
      ) : done ? (
        <>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={22} className="text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-emerald-700">Uploaded to Walrus</p>
          <p className="mt-1 text-xs text-emerald-600/70">Seal-encrypted · AuditAnchor anchored on Sui</p>
        </>
      ) : (
        <>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#326273]/8">
            <FileText size={22} className="text-[#326273]/50" />
          </div>
          <p className="text-sm font-semibold text-[#1F4452]">Drop invoice PDF here</p>
          <p className="mt-1 text-xs text-[#326273]/50">or click to browse · PDF only</p>
          <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-[#326273]/40">
            <span className="flex items-center gap-1"><Lock size={9} /> Seal-encrypted</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Database size={9} /> Walrus storage</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Shield size={9} /> 7-yr retention</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [invoices, setInvoices]   = useState<Invoice[]>(SEED_INVOICES);
  const [filter,   setFilter]     = useState<FilterType>('all');
  const [search,   setSearch]     = useState('');
  const [selected, setSelected]   = useState<Invoice | null>(null);
  const [toasts,   setToasts]     = useState<{ id: number; msg: string }[]>([]);
  const toastIdRef   = useRef(0);
  const uploadNowRef = useRef<HTMLInputElement>(null);
  const invCountRef  = useRef(41);

  // ── helpers ──────────────────────────────────────────────────────────────

  function addToast(msg: string) {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  function makeNewInvoice(fileName: string): Invoice {
    invCountRef.current++;
    const num = String(invCountRef.current).padStart(3, '0');
    const blobSuffix = `${num}_${fileName.replace(/[^a-z0-9]/gi, '').slice(0, 12).toLowerCase() || 'invoice'}`;
    return {
      id: `INV-2026-${num}`,
      vendor: fileName.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim() || 'New Invoice',
      corridor: 'USD→PHP',
      usdAmount: '$0.00',
      localAmount: 'PHP 0',
      date: '28 May 2026',
      dueDate: '28 May 2026',
      status: 'draft',
      walrusCid: `walrus:blobId_${blobSuffix}`,
      sealEncrypted: true,
      anchorObjectId: null,
      purpose: 'Uploaded invoice',
    };
  }

  function handleZoneUpload(fileName: string) {
    const newInv = makeNewInvoice(fileName);
    setInvoices((prev) => [newInv, ...prev]);
    setSelected(newInv);
    addToast(`${fileName} encrypted & stored on Walrus`);
  }

  function handleUploadNowChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const newInv = makeNewInvoice(f.name);
    setInvoices((prev) => [newInv, ...prev]);
    setSelected(newInv);
    addToast(`${f.name} encrypted & stored on Walrus`);
    e.target.value = '';
  }

  function handleDownload(inv: Invoice) {
    addToast(`Decrypting ${inv.id} from Walrus…`);
    setTimeout(() => addToast(`${inv.id} ready — saved to Downloads`), 1600);
  }

  function handleMarkPaid(inv: Invoice) {
    setInvoices((prev) =>
      prev.map((i) => (i.id === inv.id ? { ...i, status: 'paid' as const } : i))
    );
    setSelected((prev) => {
      if (!prev || prev.id !== inv.id) return prev;
      return { ...prev, status: 'paid' as const };
    });
    addToast(`${inv.id} marked as paid`);
  }

  // ── derived ───────────────────────────────────────────────────────────────

  const counts: Record<FilterType, number> = {
    all:     invoices.length,
    paid:    invoices.filter((i) => i.status === 'paid').length,
    pending: invoices.filter((i) => i.status === 'pending').length,
    overdue: invoices.filter((i) => i.status === 'overdue').length,
    draft:   invoices.filter((i) => i.status === 'draft').length,
  };

  const filtered = invoices.filter((inv) => {
    const matchFilter = filter === 'all' || inv.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      String(inv.vendor ?? '').toLowerCase().includes(q) ||
      String(inv.id ?? '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const totalUsdNum = invoices.reduce((acc, i) => {
    const n = parseFloat(i.usdAmount.replace(/[$,]/g, ''));
    return acc + (isNaN(n) ? 0 : n);
  }, 0);
  const totalUsd  = `$${totalUsdNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const walrusCnt = invoices.filter((i) => i.walrusCid).length;
  const anchorCnt = invoices.filter((i) => i.anchorObjectId).length;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* Toast stack — bottom right */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(({ id, msg }) => (
          <div
            key={id}
            className="flex items-center gap-2 rounded-xl bg-[#1F4452] px-4 py-3 text-sm text-white shadow-xl pointer-events-auto"
          >
            <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
            {msg}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <DashboardPageLogo src="/isometric/walrus-logo.svg" partner="Walrus" label="Invoice Vault · Walrus" />
          <h1 className="text-2xl font-extrabold text-[#1F4452]">Invoice Vault</h1>
          <p className="mt-0.5 text-xs text-[#326273]/50">
            All invoices Seal-encrypted and anchored on Walrus · 7-year minimum retention
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#326273]/10 bg-white px-3 py-2 text-[11px] text-[#326273]/50">
          <Lock size={12} className="text-[#5C9EAD]" />
          <span>Splash cannot read your invoices</span>
        </div>
      </header>

      {/* Stats row */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Total Invoices',   value: String(invoices.length),           sub: 'All time',           icon: FileText, accent: 'text-[#326273]',  bg: 'bg-[#326273]/10' },
          { label: 'Total Value',      value: totalUsd,                           sub: 'Across corridors',   icon: Archive,  accent: 'text-[#5C9EAD]',  bg: 'bg-[#5C9EAD]/10' },
          { label: 'Walrus Stored',    value: `${walrusCnt} / ${invoices.length}`,sub: 'Seal-encrypted',     icon: Database, accent: 'text-[#5C9EAD]',  bg: 'bg-[#5C9EAD]/10' },
          { label: 'On-chain Anchors', value: String(anchorCnt),                  sub: 'AuditAnchor on Sui', icon: Shield,   accent: 'text-emerald-600', bg: 'bg-emerald-100'  },
        ].map(({ label, value, sub, icon: Icon, accent, bg }) => (
          <div key={label} className="rounded-xl border border-white/70 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#326273]/50">{label}</span>
              <div className={cn('rounded-lg p-1.5', bg)}><Icon size={14} className={accent} /></div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-[#1F4452]">{value}</div>
            <div className="mt-0.5 text-[11px] font-medium text-[#5C9EAD]">{sub}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">

        {/* ── Left: invoice list ─────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Upload zone */}
          <UploadZone onUpload={handleZoneUpload} />

          {/* Filters + search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-[#326273]/10 bg-white px-3 py-1.5">
              <Search size={13} className="shrink-0 text-[#326273]/40" />
              <input
                type="text"
                placeholder="Search vendor or ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-36 bg-transparent text-xs text-[#1F4452] placeholder-[#326273]/30 outline-none"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="text-[#326273]/30 hover:text-[#326273]">
                  <XCircle size={13} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'paid', 'pending', 'overdue', 'draft'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold capitalize transition-colors',
                    filter === f
                      ? 'bg-[#326273] text-white'
                      : 'border border-[#326273]/10 bg-white text-[#326273]/60 hover:border-[#5C9EAD]/40'
                  )}
                >
                  {f}
                  <span className={cn('rounded-full px-1 text-[10px]', filter === f ? 'bg-white/20' : 'bg-[#326273]/8')}>
                    {counts[f]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Invoice table */}
          <div className="overflow-hidden rounded-xl border border-white/70 bg-white shadow-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#326273]/8 bg-[#F6F0ED]/60">
                  <th className="px-4 py-2.5 text-left font-semibold text-[#326273]/50">Invoice</th>
                  <th className="hidden px-4 py-2.5 text-left font-semibold text-[#326273]/50 md:table-cell">Corridor</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-[#326273]/50">Amount</th>
                  <th className="hidden px-4 py-2.5 text-left font-semibold text-[#326273]/50 lg:table-cell">Walrus</th>
                  <th className="px-4 py-2.5 text-center font-semibold text-[#326273]/50">Status</th>
                  <th className="px-4 py-2.5 text-center font-semibold text-[#326273]/50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-[#326273]/40">
                      No invoices match your filter
                    </td>
                  </tr>
                ) : filtered.map((inv, i) => (
                  <tr
                    key={inv.id}
                    className={cn(
                      'border-b border-[#326273]/5 transition-colors hover:bg-[#F6F0ED]/50',
                      i === filtered.length - 1 && 'border-b-0',
                      selected?.id === inv.id && 'bg-[#5C9EAD]/5'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#1F4452]">{inv.vendor}</div>
                      <div className="text-[10px] text-[#326273]/40">{inv.id} · {inv.date}</div>
                    </td>
                    <td className="hidden px-4 py-3 text-[#326273]/55 md:table-cell">{inv.corridor}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-semibold text-[#1F4452]">{inv.usdAmount}</div>
                      <div className="text-[10px] text-[#326273]/40">{inv.localAmount}</div>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <WalrusBadge cid={inv.walrusCid} anchored={!!inv.anchorObjectId} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusPill status={inv.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title="View details"
                          onClick={() => setSelected(selected?.id === inv.id ? null : inv)}
                          className={cn(
                            'rounded-md p-1.5 transition-colors hover:bg-[#5C9EAD]/10 hover:text-[#5C9EAD]',
                            selected?.id === inv.id
                              ? 'bg-[#5C9EAD]/15 text-[#5C9EAD]'
                              : 'text-[#326273]/40'
                          )}
                        >
                          <Eye size={13} />
                        </button>
                        {inv.walrusCid && (
                          <button
                            type="button"
                            title="Download from Walrus"
                            onClick={() => handleDownload(inv)}
                            className="rounded-md p-1.5 text-[#326273]/40 transition-colors hover:bg-[#5C9EAD]/10 hover:text-[#5C9EAD]"
                          >
                            <Download size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="rounded-xl border border-[#5C9EAD]/25 bg-white p-5 shadow-sm">

              {/* Panel header */}
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#1F4452]">{selected.vendor}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#326273]/50">
                    <span>{selected.id}</span>
                    <span>·</span>
                    <span>{selected.purpose}</span>
                    <StatusPill status={selected.status} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="ml-3 shrink-0 text-[#326273]/30 transition-colors hover:text-[#326273]"
                >
                  <XCircle size={16} />
                </button>
              </div>

              {/* Detail grid */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: 'USD Amount',   value: selected.usdAmount   },
                  { label: 'Local Amount', value: selected.localAmount  },
                  { label: 'Invoice Date', value: selected.date         },
                  { label: 'Due Date',     value: selected.dueDate      },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-[#F6F0ED] p-2.5">
                    <div className="text-[10px] text-[#326273]/45">{label}</div>
                    <div className="mt-0.5 text-xs font-semibold text-[#1F4452]">{value}</div>
                  </div>
                ))}
              </div>

              {/* Walrus details */}
              {selected.walrusCid ? (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-[#F6F0ED] px-3 py-2">
                    <Database size={13} className="shrink-0 text-[#5C9EAD]" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-[#326273]/50">Walrus Blob ID</div>
                      <div className="mt-0.5 truncate font-mono text-[11px] text-[#326273]">{selected.walrusCid}</div>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-[10px] text-[#326273]/40">
                      <Lock size={10} /> Seal-encrypted
                    </span>
                  </div>
                  {selected.anchorObjectId ? (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
                      <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-emerald-600/60">AuditAnchor · Sui Object ID</div>
                        <div className="mt-0.5 font-mono text-[11px] text-emerald-700">{selected.anchorObjectId}</div>
                      </div>
                      <a
                        href={`https://suiexplorer.com/object/${selected.anchorObjectId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-emerald-500 transition-colors hover:text-emerald-700"
                        title="View on Sui Explorer"
                      >
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
                      <AlertCircle size={13} className="shrink-0 text-amber-600" />
                      <span className="text-[11px] text-amber-700">
                        AuditAnchor pending — batch runs nightly 00:01 UTC
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 rounded-lg border-2 border-dashed border-[#326273]/10 bg-[#F6F0ED] p-4 text-center">
                  <p className="text-xs font-semibold text-[#326273]/50">No PDF uploaded yet</p>
                  <button
                    type="button"
                    onClick={() => uploadNowRef.current?.click()}
                    className="mx-auto mt-2 flex items-center gap-1.5 rounded-lg bg-[#326273] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#264e5b]"
                  >
                    <Upload size={12} /> Upload now
                  </button>
                  <input
                    ref={uploadNowRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleUploadNowChange}
                  />
                </div>
              )}

              {/* Action bar */}
              <div className="mt-4 flex flex-wrap gap-2">
                {(selected.status === 'pending' || selected.status === 'overdue') && (
                  <button
                    type="button"
                    onClick={() => handleMarkPaid(selected)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                  >
                    <CheckCircle2 size={13} /> Mark as paid
                  </button>
                )}
                {selected.walrusCid && (
                  <button
                    type="button"
                    onClick={() => handleDownload(selected)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#326273]/15 px-3 py-1.5 text-xs font-semibold text-[#326273] transition-colors hover:border-[#5C9EAD]/40 hover:text-[#5C9EAD]"
                  >
                    <Download size={13} /> Download PDF
                  </button>
                )}
                {selected.status === 'paid' && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span className="text-[11px] font-semibold text-emerald-700">Settled via Splash</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar ──────────────────────────────────────────────── */}
        <aside className="space-y-4">

          {/* How Walrus works */}
          <div className="rounded-xl border border-white/70 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Database size={15} className="text-[#5C9EAD]" />
              <h2 className="text-sm font-bold text-[#1F4452]">How Walrus Protects You</h2>
            </div>
            <div className="mt-3 space-y-3">
              {[
                { step: '1', title: 'Seal encryption', desc: 'PDF encrypted with your Sui wallet key before leaving your browser. Splash holds zero plaintext.', icon: Lock    },
                { step: '2', title: 'Walrus storage',  desc: 'Encrypted blob stored across Walrus decentralised storage network. Erasure-coded for durability.', icon: Database },
                { step: '3', title: 'AuditAnchor',     desc: 'Daily Merkle batch of blob hashes frozen as an AuditAnchor object on Sui. Regulator-verifiable.', icon: Shield   },
              ].map(({ step, title, desc, icon: Icon }) => (
                <div key={step} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5C9EAD]/15 text-[10px] font-extrabold text-[#5C9EAD]">
                    {step}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Icon size={11} className="text-[#5C9EAD]" />
                      <span className="text-xs font-bold text-[#1F4452]">{title}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-4 text-[#326273]/55">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Retention */}
          <div className="rounded-xl border border-white/70 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#5C9EAD]" />
              <span className="text-sm font-bold text-[#1F4452]">7-Year Retention</span>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-[#326273]/65">
              All Walrus blobs are pinned for a minimum of 7 years — meeting Bank Negara, MAS, and EU
              record-keeping requirements. AuditAnchors are permanently frozen on Sui.
            </p>
            <div className="mt-3 space-y-1 text-[11px]">
              {['Bank Negara MSB', 'MAS Singapore', 'EU AML Directive', 'BNI Indonesia'].map((r) => (
                <div key={r} className="flex items-center gap-1.5 text-[#326273]/55">
                  <CheckCircle2 size={11} className="text-emerald-500" /> {r}
                </div>
              ))}
            </div>
          </div>

          {/* Privacy note */}
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <Lock size={14} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <div className="text-xs font-bold text-amber-800">Privacy by design</div>
                <p className="mt-1 text-[11px] leading-4 text-amber-700">
                  Splash cannot decrypt your invoices. Only your Sui wallet key (via Seal) can access
                  the plaintext PDF. Your financial documents are yours alone.
                </p>
              </div>
            </div>
          </div>

          {/* Audit export */}
          <div className="rounded-xl border border-white/70 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#1F4452]">Audit Export</h2>
            <p className="mt-1 text-[11px] text-[#326273]/50">
              Generate a regulator-ready report with all AuditAnchor object IDs and Merkle proofs.
            </p>
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => addToast('CSV ledger export ready — check Downloads')}
                className="flex w-full items-center justify-between rounded-lg border border-[#326273]/10 px-3 py-2 text-xs font-semibold text-[#326273] transition-colors hover:border-[#5C9EAD]/40 hover:text-[#5C9EAD]"
              >
                <div className="flex items-center gap-2"><Download size={12} /> Export CSV ledger</div>
                <ChevronRight size={12} className="text-[#326273]/30" />
              </button>
              <button
                type="button"
                onClick={() => addToast('Merkle proofs package prepared')}
                className="flex w-full items-center justify-between rounded-lg border border-[#326273]/10 px-3 py-2 text-xs font-semibold text-[#326273] transition-colors hover:border-[#5C9EAD]/40 hover:text-[#5C9EAD]"
              >
                <div className="flex items-center gap-2"><Shield size={12} /> Download Merkle proofs</div>
                <ChevronRight size={12} className="text-[#326273]/30" />
              </button>
              <button
                type="button"
                onClick={() => window.open('https://suiexplorer.com', '_blank')}
                className="flex w-full items-center justify-between rounded-lg border border-[#326273]/10 px-3 py-2 text-xs font-semibold text-[#326273] transition-colors hover:border-[#5C9EAD]/40 hover:text-[#5C9EAD]"
              >
                <div className="flex items-center gap-2"><ExternalLink size={12} /> View on Sui Explorer</div>
                <ChevronRight size={12} className="text-[#326273]/30" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
