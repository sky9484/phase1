'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  LogOut,
  Send,
  Settings,
  Users,
  UserCircle,
  Phone,
  History,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transfer', href: '/dashboard/transfer', icon: Send },
  { label: 'Batch Payout', href: '/dashboard/batch', icon: Users },
  { label: 'Recipients', href: '/dashboard/recipients', icon: UserCircle },
  { label: 'History', href: '/dashboard/history', icon: History },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  function logout() {
    router.replace('/login');
  }

  return (
    <div className="flex min-h-screen bg-[linear-gradient(rgba(50,98,115,0.055),rgba(50,98,115,0.055)),#F6F0ED]">
      {/* Desktop sidebar */}
      <aside
        className={`hidden flex-col bg-[#326273] p-6 text-white transition-all duration-300 md:flex fixed left-0 top-0 z-30 h-screen ${collapsed ? 'w-24' : 'w-56'}`}
      >
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className={`mb-12 flex items-center rounded-xl transition-colors hover:text-white ${collapsed ? 'mx-auto justify-center' : 'gap-4'}`}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {collapsed ? (
            <div className="h-8 w-8">
              <Image
                src="/splash-logo.png"
                alt="SPLASH"
                width={32}
                height={32}
                className="h-full w-full object-contain brightness-0 invert"
                unoptimized
              />
            </div>
          ) : (
            <>
              <Image
                src="/splash-logo.png"
                alt="SPLASH"
                width={40}
                height={40}
                className="h-10 w-10 object-contain brightness-0 invert"
                unoptimized
              />
              <span className="text-2xl font-semibold tracking-[-0.03em] text-white">Splash</span>
            </>
          )}
        </button>
        <nav className="flex-1 space-y-4 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              className={`flex items-center rounded-xl px-3 py-2 transition-colors hover:bg-white/10 hover:text-[#5C9EAD] ${collapsed ? 'justify-center' : 'gap-3'} ${pathname === href ? 'bg-white/10 text-[#5C9EAD]' : ''}`}
              href={href}
              title={collapsed ? label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>
        <Link
          href="/dashboard/customer-service"
          className={`flex items-center rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/10 hover:text-[#5C9EAD] ${collapsed ? 'justify-center' : 'gap-3'} ${pathname === '/dashboard/customer-service' ? 'bg-white/10 text-[#5C9EAD]' : ''}`}
          title={collapsed ? 'Customer Service' : undefined}
        >
          <Phone size={20} />
          {!collapsed && <span className="text-xs">Customer Service</span>}
        </Link>
        <button
          type="button"
          onClick={logout}
          className={`flex items-center rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/10 hover:text-[#E39774] ${collapsed ? 'justify-center' : 'gap-3'}`}
          title={collapsed ? 'Log out' : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>Log out</span>}
        </button>
      </aside>

      {/* Mobile top header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between bg-[#326273] px-4 py-3 md:hidden">
        <div className="flex items-center gap-3">
          <Image
            src="/splash-logo.png"
            alt="SPLASH"
            width={28}
            height={28}
            className="h-7 w-7 object-contain brightness-0 invert"
            unoptimized
          />
          <span className="text-lg font-semibold text-white">Splash</span>
        </div>
        <button type="button" onClick={() => setMobileOpen((v) => !v)} className="text-white">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile overlay menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-[#326273] pt-16 md:hidden">
          <div className="flex flex-col h-full">
            <nav className="flex-1 space-y-2 p-6">
              {navItems.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-white transition-colors hover:bg-white/10 ${pathname === href ? 'bg-white/10 text-[#5C9EAD]' : ''}`}
                  href={href}
                >
                  <Icon size={22} />
                  <span className="font-semibold">{label}</span>
                </Link>
              ))}
              <Link
                href="/dashboard/customer-service"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-white transition-colors hover:bg-white/10 ${pathname === '/dashboard/customer-service' ? 'bg-white/10 text-[#5C9EAD]' : ''}`}
              >
                <Phone size={22} />
                <span className="font-semibold">Customer Service</span>
              </Link>
            </nav>
            <div className="p-6">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-white transition-colors hover:bg-white/10 hover:text-[#E39774]"
              >
                <LogOut size={22} />
                <span className="font-semibold">Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main
        className={`relative z-0 min-w-0 flex-1 overflow-x-hidden p-4 pt-16 transition-all duration-300 md:p-8 md:pt-8 md:ml-0 ${collapsed ? 'md:ml-24' : 'md:ml-56'}`}
      >
        {children}
      </main>
    </div>
  );
}
