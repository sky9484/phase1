'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, OctagonAlert } from 'lucide-react';

export type PegZone = 'green' | 'yellow' | 'red';

type PegZoneResponse = {
  zone?: PegZone;
};

type PegZoneBannerProps = {
  onZoneChange?: (zone: PegZone) => void;
};

export default function PegZoneBanner({ onZoneChange }: PegZoneBannerProps) {
  const [zone, setZone] = useState<PegZone>('green');

  useEffect(() => {
    let cancelled = false;

    async function pollPegStatus() {
      try {
        const response = await fetch('/api/quotes/peg-status', { cache: 'no-store' });
        if (!response.ok) return;

        const body = (await response.json()) as PegZoneResponse;
        const nextZone = body.zone ?? 'green';

        if (!cancelled) {
          setZone(nextZone);
          onZoneChange?.(nextZone);
        }
      } catch {
      }
    }

    void pollPegStatus();
    const interval = window.setInterval(pollPegStatus, 15_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [onZoneChange]);

  if (zone === 'green') return null;

  if (zone === 'red') {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-50 p-4 text-red-500">
        <div className="flex gap-3">
          <OctagonAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-bold">Cross-border transfers are temporarily paused due to market conditions.</div>
            <p className="mt-1 text-sm text-red-500/80">We&apos;ll notify you when service resumes. Existing transfers are unaffected.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E39774]/20 bg-[#E39774]/10 p-4 text-[#E39774]">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <div className="font-bold">Stablecoin markets are experiencing minor volatility.</div>
          <p className="mt-1 text-sm text-[#326273]/70">Your transfer will proceed with a slightly adjusted rate.</p>
        </div>
      </div>
    </div>
  );
}
