'use client';

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, LogOut, ShieldCheck } from 'lucide-react';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { cn } from '@/shared/lib/utils';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/tenants', label: 'Mijozlar', icon: Building2, end: false },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const username = useAdminAuthStore((s) => s.username);
  const logout = useAdminAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-primary)]">
      {/* Fixed dark sidebar regardless of the viewer's light/dark preference - it previously used
          --color-text-primary as a background (a light/dark "inversion" trick), which broke once
          that token itself became theme-aware and turned light in dark mode. */}
      <aside className="w-60 flex-shrink-0 bg-[#1D1D1F] text-white flex flex-col">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-bold">Admin Panel</span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-body font-medium transition-colors',
                  isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10 space-y-2">
          {username && <p className="px-3 text-caption text-white/50 truncate">{username}</p>}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Chiqish
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
