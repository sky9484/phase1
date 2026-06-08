import Image from 'next/image';

/**
 * Section tag shown at the top of each dashboard page: the contextual
 * partner logo (isometric) sitting in a rounded container box, followed
 * by the section label. Replaces the old per-page lucide icon chips.
 */
export default function DashboardPageLogo({
  src,
  partner,
  label,
}: {
  src: string;
  partner: string;
  label: string;
}) {
  return (
    <div className="mb-2 inline-flex items-center gap-2 rounded-xl border border-[#326273]/10 bg-white py-1 pl-1 pr-3 shadow-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F6F0ED]">
        <Image
          src={src}
          alt={`${partner} logo`}
          width={28}
          height={28}
          className="h-6 w-6 object-contain"
          unoptimized
        />
      </span>
      <span className="text-[11px] font-bold uppercase tracking-wide text-[#326273]/70">{label}</span>
    </div>
  );
}
