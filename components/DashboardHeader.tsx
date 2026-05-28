'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Check,
  ChevronDown,
  LogOut,
  Palette,
  Search,
  Settings,
} from 'lucide-react';

export type Theme = 'default' | 'navy' | 'teal';

const THEMES: { id: Theme; label: string; colors: [string, string, string] }[] = [
  { id: 'default', label: 'Splash',      colors: ['#1F4452', '#5C9EAD', '#E39774'] },
  { id: 'navy',    label: 'Navy Blue',   colors: ['#1E3888', '#47A8BD', '#FFAD69'] },
  { id: 'teal',    label: 'Ocean Teal',  colors: ['#0FA692', '#37AD9E', '#FC8F12'] },
];

interface DashboardHeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  collapsed: boolean;
}

export default function DashboardHeader({
  theme,
  onThemeChange,
  collapsed,
}: DashboardHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeOpen,   setThemeOpen]   = useState(false);
  const [avatar,      setAvatar]      = useState<string | null>(null);

  const profileRef   = useRef<HTMLDivElement>(null);
  const themeRef     = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Close both dropdowns on outside click */
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (themeRef.current   && !themeRef.current.contains(e.target as Node))   setThemeOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(URL.createObjectURL(file));
    setProfileOpen(false);
  }

  const active = THEMES.find((t) => t.id === theme)!;

  return (
    <header
      className={`fixed top-0 right-0 z-20 hidden h-[60px] items-center justify-between border-b border-[#326273]/10 bg-[#F6F0ED] px-5 shadow-sm md:flex transition-[left] duration-300 ${
        collapsed ? 'left-20' : 'left-60'
      }`}
    >
      {/* ── Search ─────────────────────────────────────────── */}
      <div className="flex max-w-sm flex-1 items-center gap-2 rounded-xl border border-[#326273]/10 bg-white px-3 py-2 shadow-sm">
        <Search size={14} className="shrink-0 text-[#326273]/35" />
        <input
          type="text"
          placeholder="Search dashboard…"
          className="flex-1 bg-transparent text-sm text-[#326273] placeholder-[#326273]/35 outline-none"
        />
      </div>

      {/* ── Right controls ─────────────────────────────────── */}
      <div className="flex items-center gap-2.5">

        {/* Theme picker */}
        <div ref={themeRef} className="relative">
          <button
            type="button"
            onClick={() => { setThemeOpen((v) => !v); setProfileOpen(false); }}
            className="flex items-center gap-2 rounded-xl border border-[#326273]/10 bg-white px-3 py-2 text-xs font-medium text-[#326273]/65 shadow-sm transition-colors hover:bg-[#F6F0ED] hover:text-[#326273]"
          >
            <Palette size={14} className="text-[#326273]/45" />
            <span className="hidden sm:inline">Theme</span>
            {/* current-theme swatch */}
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

          {themeOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 overflow-hidden rounded-2xl border border-[#326273]/10 bg-white shadow-xl">
              <div className="border-b border-[#326273]/8 px-4 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#326273]/40">
                  Dashboard Theme
                </p>
              </div>
              <div className="space-y-0.5 p-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { onThemeChange(t.id); setThemeOpen(false); }}
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
                    {theme === t.id && (
                      <Check size={12} className="text-[#5C9EAD] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile + dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => { setProfileOpen((v) => !v); setThemeOpen(false); }}
            className="flex items-center gap-2 rounded-xl border border-[#326273]/10 bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm transition-colors hover:bg-[#F6F0ED]"
          >
            {/* Avatar */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1F4452]">
              {avatar
                ? <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                : <span className="text-[11px] font-bold text-white">D</span>
              }
            </div>
            {/* Name */}
            <div className="hidden text-left sm:block">
              <div className="text-xs font-semibold leading-none text-[#326273]">Daniel</div>
              <div className="mt-0.5 text-[10px] leading-none text-[#326273]/40">Admin</div>
            </div>
            <ChevronDown
              size={13}
              className={`text-[#326273]/40 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 overflow-hidden rounded-2xl border border-[#326273]/10 bg-white shadow-xl">
              {/* User info header */}
              <div className="flex items-center gap-3 border-b border-[#326273]/8 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1F4452]">
                  {avatar
                    ? <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                    : <span className="text-sm font-bold text-white">D</span>
                  }
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#326273]">Daniel</div>
                  <div className="truncate text-[10px] text-[#326273]/40">
                    skyhandsome94@gmail.com
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-0.5 p-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-[#326273]/65 transition-colors hover:bg-[#F6F0ED] hover:text-[#326273]"
                >
                  <Camera size={13} />
                  Change profile photo
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-[#326273]/65 transition-colors hover:bg-[#F6F0ED] hover:text-[#326273]"
                >
                  <Settings size={13} />
                  Account settings
                </button>
              </div>

              <div className="border-t border-[#326273]/8 p-1.5">
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-[#E39774] transition-colors hover:bg-orange-50"
                >
                  <LogOut size={13} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input for avatar upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>
    </header>
  );
}
