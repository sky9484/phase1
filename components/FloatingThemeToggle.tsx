'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Check, Palette } from 'lucide-react';
import { THEMES, useDashTheme } from '@/components/dash-theme';

/**
 * Floating colour-theme switcher shown on every page that doesn't already
 * carry the dashboard header picker. Writes the theme globally (see
 * dash-theme.ts), so the choice persists across landing, auth, and admin.
 */
export default function FloatingThemeToggle() {
  const pathname = usePathname();
  const [theme, setTheme] = useDashTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // The dashboard has its own theme picker in the header — avoid a duplicate.
  if (pathname?.startsWith('/dashboard')) return null;

  const active = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div ref={ref} className="fixed bottom-5 left-5 z-[60]">
      {open && (
        <div className="absolute bottom-[calc(100%+10px)] left-0 w-56 overflow-hidden rounded-2xl border border-[#326273]/12 bg-white shadow-2xl shadow-[#326273]/20">
          <div className="border-b border-[#326273]/8 px-4 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#326273]/40">
              Colour theme
            </p>
          </div>
          <div className="space-y-0.5 p-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs transition-colors ${
                  theme === t.id
                    ? 'bg-[#F6F0ED] font-semibold text-[#326273]'
                    : 'text-[#326273]/60 hover:bg-[#F6F0ED]/60 hover:text-[#326273]'
                }`}
              >
                <span className="flex gap-1">
                  {t.colors.map((c, i) => (
                    <span
                      key={i}
                      className="h-4 w-4 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </span>
                <span className="flex-1 text-left">{t.label}</span>
                {theme === t.id && <Check size={12} className="shrink-0 text-[#5C9EAD]" />}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change colour theme"
        className="flex items-center gap-2 rounded-full border border-[#326273]/12 bg-white/90 px-3.5 py-2.5 text-xs font-semibold text-[#326273] shadow-lg shadow-[#326273]/15 backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-xl"
      >
        <Palette size={15} className="text-[#5C9EAD]" />
        <span className="hidden sm:inline">Theme</span>
        <span className="flex gap-0.5">
          {active.colors.map((c, i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-full border border-black/10"
              style={{ backgroundColor: c }}
            />
          ))}
        </span>
      </button>
    </div>
  );
}
