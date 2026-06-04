'use client';

import Image from 'next/image';
import { useEffect, useState, type ReactNode } from 'react';
import FloatingCopilot from '../../components/FloatingCopilot';
import DashboardHeader, { type Theme } from '../../components/DashboardHeader';
import { useDashTheme } from '@/components/dash-theme';
import {
  Bot,
  FileText,
  History,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Phone,
  Send,
  Settings,
  TrendingUp,
  UserCircle,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// ─── Theme CSS injected at runtime ───────────────────────────────────────────
// Using [class~="token"] attribute selectors so they work regardless of how
// Lightning CSS / Tailwind v4 processes escaped class-name selectors at build time.
// !important ensures these win over all Tailwind utility CSS layers.

const NAVY_CSS = `
[data-dash-theme="navy"] [class~="bg-[#EDE8E4]"]   { background-color:#EEF1FF!important }
[data-dash-theme="navy"] [class~="bg-[#F6F0ED]"]   { background-color:#F2F5FF!important }
[data-dash-theme="navy"] [class~="bg-[#1F4452]"]   { background-color:#1E3888!important }
[data-dash-theme="navy"] [class~="bg-[#326273]"]   { background-color:#2a4d80!important }
[data-dash-theme="navy"] [class~="bg-[#5C9EAD]"]   { background-color:#47A8BD!important }
[data-dash-theme="navy"] [class~="bg-[#E39774]"]   { background-color:#FFAD69!important }
[data-dash-theme="navy"] [class~="bg-[#C97A56]"]   { background-color:#9C3848!important }
[data-dash-theme="navy"] [class~="bg-[#264e5b]"]   { background-color:#152a6d!important }
[data-dash-theme="navy"] [class~="text-[#1F4452]"] { color:#1E3888!important }
[data-dash-theme="navy"] [class~="text-[#326273]"] { color:#2a4d80!important }
[data-dash-theme="navy"] [class~="text-[#5C9EAD]"] { color:#47A8BD!important }
[data-dash-theme="navy"] [class~="text-[#E39774]"] { color:#FFAD69!important }
[data-dash-theme="navy"] [class~="text-[#C97A56]"] { color:#9C3848!important }
[data-dash-theme="navy"] [class~="border-[#326273]"] { border-color:#2a4d80!important }
[data-dash-theme="navy"] [class~="border-[#5C9EAD]"] { border-color:#47A8BD!important }
[data-dash-theme="navy"] [class~="border-[#E39774]"] { border-color:#FFAD69!important }
[data-dash-theme="navy"] [class~="hover:bg-[#264e5b]"]:hover   { background-color:#152a6d!important }
[data-dash-theme="navy"] [class~="hover:bg-[#1F4452]"]:hover   { background-color:#1E3888!important }
[data-dash-theme="navy"] [class~="hover:bg-[#326273]"]:hover   { background-color:#2a4d80!important }
[data-dash-theme="navy"] [class~="hover:text-[#E39774]"]:hover { color:#FFAD69!important }
`;

const TEAL_CSS = `
[data-dash-theme="teal"] [class~="bg-[#EDE8E4]"]   { background-color:#F0F8F7!important }
[data-dash-theme="teal"] [class~="bg-[#F6F0ED]"]   { background-color:#F7FAFB!important }
[data-dash-theme="teal"] [class~="bg-[#1F4452]"]   { background-color:#0FA692!important }
[data-dash-theme="teal"] [class~="bg-[#326273]"]   { background-color:#0d8a79!important }
[data-dash-theme="teal"] [class~="bg-[#5C9EAD]"]   { background-color:#37AD9E!important }
[data-dash-theme="teal"] [class~="bg-[#E39774]"]   { background-color:#FC8F12!important }
[data-dash-theme="teal"] [class~="bg-[#C97A56]"]   { background-color:#B88142!important }
[data-dash-theme="teal"] [class~="bg-[#264e5b]"]   { background-color:#0a7d6e!important }
[data-dash-theme="teal"] [class~="text-[#1F4452]"] { color:#0FA692!important }
[data-dash-theme="teal"] [class~="text-[#326273]"] { color:#0d8a79!important }
[data-dash-theme="teal"] [class~="text-[#5C9EAD]"] { color:#37AD9E!important }
[data-dash-theme="teal"] [class~="text-[#E39774]"] { color:#FC8F12!important }
[data-dash-theme="teal"] [class~="text-[#C97A56]"] { color:#B88142!important }
[data-dash-theme="teal"] [class~="border-[#326273]"] { border-color:#0d8a79!important }
[data-dash-theme="teal"] [class~="border-[#5C9EAD]"] { border-color:#37AD9E!important }
[data-dash-theme="teal"] [class~="border-[#E39774]"] { border-color:#FC8F12!important }
[data-dash-theme="teal"] [class~="hover:bg-[#264e5b]"]:hover   { background-color:#0a7d6e!important }
[data-dash-theme="teal"] [class~="hover:bg-[#1F4452]"]:hover   { background-color:#0FA692!important }
[data-dash-theme="teal"] [class~="hover:bg-[#326273]"]:hover   { background-color:#0d8a79!important }
[data-dash-theme="teal"] [class~="hover:text-[#E39774]"]:hover { color:#FC8F12!important }
`;

const AZURE_CSS = `
[data-dash-theme="azure"] [class~="bg-[#EDE8E4]"]   { background-color:#E1E5F2!important }
[data-dash-theme="azure"] [class~="bg-[#F6F0ED]"]   { background-color:#EEF0F8!important }
[data-dash-theme="azure"] [class~="bg-[#1F4452]"]   { background-color:#022B3A!important }
[data-dash-theme="azure"] [class~="bg-[#326273]"]   { background-color:#1F7A8C!important }
[data-dash-theme="azure"] [class~="bg-[#5C9EAD]"]   { background-color:#2BACC5!important }
[data-dash-theme="azure"] [class~="bg-[#E39774]"]   { background-color:#2384E4!important }
[data-dash-theme="azure"] [class~="bg-[#C97A56]"]   { background-color:#13589C!important }
[data-dash-theme="azure"] [class~="bg-[#264e5b]"]   { background-color:#011A23!important }
[data-dash-theme="azure"] [class~="text-[#1F4452]"] { color:#022B3A!important }
[data-dash-theme="azure"] [class~="text-[#326273]"] { color:#0C3139!important }
[data-dash-theme="azure"] [class~="text-[#5C9EAD]"] { color:#1F7A8C!important }
[data-dash-theme="azure"] [class~="text-[#E39774]"] { color:#13589C!important }
[data-dash-theme="azure"] [class~="text-[#C97A56]"] { color:#13589C!important }
[data-dash-theme="azure"] [class~="border-[#326273]"] { border-color:#1F7A8C!important }
[data-dash-theme="azure"] [class~="border-[#5C9EAD]"] { border-color:#2BACC5!important }
[data-dash-theme="azure"] [class~="border-[#E39774]"] { border-color:#2384E4!important }
[data-dash-theme="azure"] [class~="hover:bg-[#264e5b]"]:hover   { background-color:#011A23!important }
[data-dash-theme="azure"] [class~="hover:bg-[#1F4452]"]:hover   { background-color:#022B3A!important }
[data-dash-theme="azure"] [class~="hover:bg-[#326273]"]:hover   { background-color:#1F7A8C!important }
[data-dash-theme="azure"] [class~="hover:text-[#E39774]"]:hover { color:#13589C!important }
`;

const THEME_CSS: Record<Theme, string> = {
  default: '',
  navy:    NAVY_CSS,
  teal:    TEAL_CSS,
  azure:   AZURE_CSS,
};

// ─── Nav structure ────────────────────────────────────────────────────────────

type NavItem = { label: string; href: string; icon: LucideIcon; badge?: string };
type NavGroup = { title: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    title: 'Payments',
    items: [
      { label: 'Overview',     href: '/dashboard',          icon: LayoutDashboard },
      { label: 'Transfer',     href: '/dashboard/transfer', icon: Send },
      { label: 'Batch Payout', href: '/dashboard/batch',    icon: Layers },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Treasury',   href: '/dashboard/treasury', icon: TrendingUp, badge: '4.8%' },
      { label: 'Invoices',   href: '/dashboard/invoices', icon: FileText },
      { label: 'AI Copilot', href: '/dashboard/copilot',  icon: Bot,        badge: 'New' },
    ],
  },
  {
    title: 'Contacts',
    items: [
      { label: 'Recipients', href: '/dashboard/recipients', icon: UserCircle },
      { label: 'History',    href: '/dashboard/history',    icon: History },
    ],
  },
];

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme,      handleThemeChange] = useDashTheme();
  const router   = useRouter();
  const pathname = usePathname();

  /* 1. Inject / update theme <style> tag whenever theme changes.
        This bypasses any build-time CSS processing and guarantees the
        [class~="..."] rules are live in the document immediately. */
  useEffect(() => {
    const STYLE_ID = 'dash-theme-style';
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = THEME_CSS[theme];
  }, [theme]);

  function logout() {
    router.replace('/login');
  }

  return (
    /*
     * data-dash-theme attribute drives the CSS theme overrides.
     * CSS in globals.css + the injected <style> tag both target
     * [data-dash-theme="navy"] / [data-dash-theme="teal"] descendants.
     */
    <div data-dash-theme={theme}>
      <div className="flex min-h-screen splash-page-bg">

        {/* ── Desktop top header ───────────────────────────────── */}
        <DashboardHeader
          theme={theme}
          onThemeChange={handleThemeChange}
          collapsed={collapsed}
        />

        {/* ── Desktop sidebar ──────────────────────────────────── */}
        <aside
          className={`hidden flex-col bg-[#1F4452] p-4 text-white transition-all duration-300 md:flex fixed left-0 top-0 z-30 h-screen ${
            collapsed ? 'w-20' : 'w-60'
          }`}
        >
          {/* Logo / collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={`mb-8 flex items-center rounded-xl transition-colors hover:bg-white/10 ${
              collapsed ? 'mx-auto justify-center p-2' : 'gap-3 px-2 py-2'
            }`}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            <Image
              src="/splash-logo.png"
              alt="Splash"
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 object-contain brightness-0 invert"
              unoptimized
            />
            {!collapsed && (
              <span className="text-xl font-bold tracking-tight text-white">
                Splash<span className="text-[#5C9EAD]">.</span>
              </span>
            )}
          </button>

          {/* Nav groups */}
          <nav className="flex-1 space-y-5 overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.title}>
                {!collapsed && (
                  <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-white/25">
                    {group.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {group.items.map(({ label, href, icon: Icon, badge }) => {
                    const active = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        title={collapsed ? label : undefined}
                        className={`flex items-center rounded-lg px-2 py-2 text-sm transition-colors ${
                          collapsed ? 'justify-center' : 'gap-3'
                        } ${
                          active
                            ? 'bg-white/15 text-white'
                            : 'text-white/55 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon size={18} className={active ? 'text-[#5C9EAD]' : ''} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 font-medium">{label}</span>
                            {badge && (
                              <span
                                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                  badge === 'New'
                                    ? 'bg-[#E39774]/25 text-[#E39774]'
                                    : 'bg-[#5C9EAD]/20 text-[#5C9EAD]'
                                }`}
                              >
                                {badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom items */}
          <div className="space-y-0.5 border-t border-white/10 pt-4">
            <Link
              href="/dashboard/settings"
              title={collapsed ? 'Settings' : undefined}
              className={`flex items-center rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white/10 hover:text-white ${
                collapsed ? 'justify-center' : 'gap-3'
              } ${
                pathname === '/dashboard/settings'
                  ? 'bg-white/15 text-white'
                  : 'text-white/55'
              }`}
            >
              <Settings size={18} />
              {!collapsed && <span className="font-medium">Settings</span>}
            </Link>
            <Link
              href="/dashboard/customer-service"
              title={collapsed ? 'Support' : undefined}
              className={`flex items-center rounded-lg px-2 py-2 text-sm text-white/55 transition-colors hover:bg-white/10 hover:text-white ${
                collapsed ? 'justify-center' : 'gap-3'
              }`}
            >
              <Phone size={18} />
              {!collapsed && <span className="font-medium">Support</span>}
            </Link>
            <button
              type="button"
              onClick={logout}
              title={collapsed ? 'Log out' : undefined}
              className={`flex w-full items-center rounded-lg px-2 py-2 text-sm text-white/55 transition-colors hover:bg-white/10 hover:text-[#E39774] ${
                collapsed ? 'justify-center' : 'gap-3'
              }`}
            >
              <LogOut size={18} />
              {!collapsed && <span className="font-medium">Log out</span>}
            </button>
          </div>
        </aside>

        {/* ── Mobile top header ─────────────────────────────────── */}
        <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between bg-[#1F4452] px-4 py-3 md:hidden">
          <div className="flex items-center gap-3">
            <Image
              src="/splash-logo.png"
              alt="Splash"
              width={28}
              height={28}
              className="h-7 w-7 object-contain brightness-0 invert"
              unoptimized
            />
            <span className="text-lg font-bold text-white">
              Splash<span className="text-[#5C9EAD]">.</span>
            </span>
          </div>
          <button type="button" onClick={() => setMobileOpen((v) => !v)} className="text-white">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* ── Mobile overlay ────────────────────────────────────── */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-[#1F4452] pt-16 md:hidden">
            <div className="flex h-full flex-col p-6">
              <nav className="flex-1 space-y-1 overflow-y-auto">
                {navGroups.flatMap((g) => g.items).map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    onClick={() => setMobileOpen(false)}
                    href={href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-white transition-colors hover:bg-white/10 ${
                      pathname === href ? 'bg-white/15 text-[#5C9EAD]' : ''
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-semibold">{label}</span>
                  </Link>
                ))}
              </nav>
              <button
                type="button"
                onClick={() => { setMobileOpen(false); logout(); }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-white transition-colors hover:bg-white/10 hover:text-[#E39774]"
              >
                <LogOut size={20} />
                <span className="font-semibold">Log out</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Main content ──────────────────────────────────────── */}
        {/* Mobile top pad = 60 px (mobile header); desktop = 76 px (desktop header + gap) */}
        <main
          className={`relative z-0 min-w-0 flex-1 overflow-x-hidden transition-all duration-300 p-4 pt-[60px] pb-16 md:px-8 md:pb-8 md:pt-[76px] ${
            collapsed ? 'md:ml-20' : 'md:ml-60'
          }`}
        >
          {children}
        </main>

        {/* ── Floating AI Copilot widget ────────────────────────── */}
        <FloatingCopilot />
      </div>
    </div>
  );
}
