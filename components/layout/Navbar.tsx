'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/lib/types';

interface NavLink {
  href: string;
  label: string;
}

const recruiterLinks: NavLink[] = [
  { href: '/recruiter/dashboard', label: 'Dashboard' },
  { href: '/recruiter/jobs', label: 'My Jobs' },
];

const seekerLinks: NavLink[] = [
  { href: '/seeker/dashboard', label: 'Dashboard' },
  { href: '/seeker/jobs', label: 'Browse Jobs' },
  { href: '/seeker/saved', label: 'Saved Jobs' },
  { href: '/seeker/applications', label: 'My Applications' },
];

interface NavbarProps {
  role: UserRole;
  userName?: string;
}

export default function Navbar({ role, userName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const links = role === 'recruiter' ? recruiterLinks : seekerLinks;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <nav className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href={role === 'recruiter' ? '/recruiter/dashboard' : '/seeker/dashboard'}
            className="flex items-center space-x-2 shrink-0"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">J</span>
            </div>
            <span className="text-white font-bold text-lg">JobBoard</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive(link.href)
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {userName && (
              <span className="text-slate-400 text-sm">
                Hi, <span className="text-white font-medium">{userName}</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-slate-300 hover:text-white transition text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-700/50 disabled:opacity-50"
            >
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-700 bg-slate-800 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2.5 px-3 rounded-lg transition text-sm font-medium ${
                  isActive(link.href)
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-700 mt-2">
              {userName && (
                <p className="text-slate-400 text-sm px-3 py-2">
                  Signed in as <span className="text-white font-medium">{userName}</span>
                </p>
              )}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full text-left py-2.5 px-3 rounded-lg text-red-400 hover:bg-red-500/10 transition text-sm font-medium disabled:opacity-50"
              >
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
