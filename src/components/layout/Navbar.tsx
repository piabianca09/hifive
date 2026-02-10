'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export default function Navbar() {
  const { user, userRole, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { theme, setTheme } = useThemeStore();

  // Sync theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (storedTheme) {
        setTheme(storedTheme);
      }
    }
  }, [setTheme]);

  if (!user) return null;

  return (
    <nav className="bg-gradient-to-r from-[#03034b] to-[#1827a0] shadow-xl text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-2xl font-bold tracking-tight">
              HiFive
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 hover:scale-105"
            >
              {theme === 'light' ? (
                <span className="text-lg" title="Switch to dark mode" role="img">🌙</span>
              ) : (
                <span className="text-lg" title="Switch to light mode" role="img">☀️</span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-[#e8e4d5] flex items-center space-x-2 transition-colors duration-200"
              >
                <span className="text-sm">{user.email}</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gradient-to-b from-[#03034b] to-[#1827a0] rounded-lg shadow-xl py-2 z-50 border border-white border-opacity-20 transform origin-top-right transition-all duration-200 ease-out">
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-[#0c5ee5] transition-colors duration-200 rounded-lg mx-2 my-1"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}