'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle({
  className = '',
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<'dark' | 'light'>;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      } else {
        const currentDark = document.documentElement.classList.contains('dark');
        setTheme(currentDark ? 'dark' : 'light');
      }
    };

    window.addEventListener('ironpeak-theme-change', handleThemeChange);
    return () => {
      window.removeEventListener('ironpeak-theme-change', handleThemeChange);
    };
  }, []);

  const selectTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('ironpeak-theme', 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('ironpeak-theme', 'light');
      } catch {}
    }

    window.dispatchEvent(
      new CustomEvent('ironpeak-theme-change', { detail: newTheme })
    );
  };

  const toggleTheme = () => {
    selectTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center rounded-xl border border-white/10 p-1 text-xs opacity-50 ${className}`}
      >
        <span className="px-2 py-1">🌙 Dark</span>
      </div>
    );
  }

  // Segmented Pill with both Dark & Light options
  if (showLabel) {
    return (
      <div
        className={`inline-flex items-center rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-black/40 p-1 text-xs font-semibold ${className}`}
        role="group"
        aria-label="Theme selector"
      >
        <button
          type="button"
          onClick={() => selectTheme('dark')}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition cursor-pointer ${
            theme === 'dark'
              ? 'bg-[#ff7043] text-[#101321] font-bold shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Switch to Dark theme"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => selectTheme('light')}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition cursor-pointer ${
            theme === 'light'
              ? 'bg-[#ff7043] text-[#101321] font-bold shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Switch to Light theme"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" />
            <path strokeLinecap="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          <span>Light</span>
        </button>
      </div>
    );
  }

  // Compact icon toggle
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Current: ${theme === 'dark' ? 'Dark' : 'Light'} mode (click to toggle)`}
      className={`inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-black/30 p-2 text-xs font-semibold hover:border-lime/60 transition cursor-pointer ${className}`}
    >
      {theme === 'dark' ? (
        <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" />
          <path strokeLinecap="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}
