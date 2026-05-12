'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';

const RATES = [
  { pair: 'MYR/PHP', rate: 12.08, precision: 3 },
  { pair: 'MYR/IDR', rate: 3364, precision: 0 },
  { pair: 'MYR/SGD', rate: 0.285, precision: 3 },
  { pair: 'MYR/THB', rate: 7.72, precision: 3 },
  { pair: 'MYR/VND', rate: 5432, precision: 0 },
  { pair: 'MYR/BND', rate: 0.285, precision: 3 },
  { pair: 'MYR/KHR', rate: 864, precision: 0 },
  { pair: 'MYR/LAK', rate: 4612, precision: 0 },
  { pair: 'MYR/MMK', rate: 446, precision: 0 },
];

export default function LiveExchangeTicker() {
  const [rates, setRates] = useState(() => RATES.map((rate) => ({ ...rate, change: 0 })));
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Initial date is set on mount to avoid SSR hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastUpdate(new Date());
    const interval = window.setInterval(() => {
      setRates((prev) =>
        prev.map((r) => {
          const change = (Math.random() - 0.48) * (r.rate * 0.0018);

          return {
            ...r,
            rate: Math.max(r.rate + change, 0),
            change,
          };
        })
      );
      setLastUpdate(new Date());
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes splashFxTicker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <div className="overflow-hidden rounded-2xl border border-[#326273]/10 bg-[#326273] py-3 shadow-lg shadow-[#326273]/10">
        <div className="flex items-center gap-8">
          <div className="flex shrink-0 items-center gap-2 border-r border-white/10 px-5 text-sm font-bold text-white/75">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E39774] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#E39774]" />
            </span>
            <Activity className="h-4 w-4 text-[#5C9EAD]" />
            <span>MYR LIVE FX</span>
            <span className="hidden text-xs text-white/45 sm:inline">Updated {lastUpdate?.toLocaleTimeString() ?? '—'}</span>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex w-max animate-[splashFxTicker_38s_linear_infinite] items-center gap-8 whitespace-nowrap">
              {[...rates, ...rates].map((item, index) => {
                const positive = item.change >= 0;

                return (
                  <div key={`${item.pair}-${index}`} className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-sm font-semibold text-white">{item.pair}</span>
                    <span className="font-mono text-sm text-[#5C9EAD]">{item.rate.toFixed(item.precision)}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-mono ${positive ? 'bg-[#5C9EAD]/10 text-[#5C9EAD]' : 'bg-[#E39774]/10 text-[#E39774]'}`}>
                      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {positive ? '+' : ''}{item.change.toFixed(item.precision)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
