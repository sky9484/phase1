'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { LayoutDashboard, LogOut, Send, Settings, Users, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Batch Payout', href: '/dashboard/batch', icon: Users },
  { label: 'Transfer', href: '/dashboard/transfer', icon: Send },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  function logout() {
    router.replace('/login');
  }

  return (
    <div className="flex min-h-screen bg-[#F6F0ED]">
      <aside className={`hidden flex-col bg-[#326273] p-6 text-white transition-all duration-300 md:flex fixed h-screen ${collapsed ? 'w-24' : 'w-56'}`}>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className={`mb-12 flex items-center rounded-xl transition-colors hover:text-white ${collapsed ? 'mx-auto justify-center' : 'gap-4'}`}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {collapsed ? (
            <div className="h-8 w-8">
              <Image src="/splash-logo.png" alt="SPLASH" width={32} height={32} className="h-full w-full object-contain brightness-0 invert" unoptimized />
            </div>
          ) : (
            <>
              <Image src="/splash-logo.png" alt="SPLASH" width={40} height={40} className="h-10 w-10 object-contain brightness-0 invert" unoptimized />
              <span className="text-2xl font-semibold tracking-[-0.03em] text-white">Splash</span>
            </>
          )}
        </button>
        <nav className="flex-1 space-y-4 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              className={`flex items-center rounded-xl px-3 py-2 transition-colors hover:bg-white/10 hover:text-[#5C9EAD] ${collapsed ? 'justify-center' : 'gap-3'}`}
              href={href}
              title={collapsed ? label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>
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
      <main className={`flex-1 p-8 transition-all duration-300 md:ml-0 ${collapsed ? 'md:ml-24' : 'md:ml-56'}`}>{children}</main>
    </div>
  );
}
