'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon, MonitorIcon } from './Icons';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  className?: string;
}

// Simple Toggle Button
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2.5 rounded-xl transition-all duration-200
        bg-slate-100 dark:bg-slate-800
        hover:bg-slate-200 dark:hover:bg-slate-700
        text-slate-600 dark:text-slate-300
        border border-slate-200 dark:border-slate-700
        ${className}
      `}
      aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {resolvedTheme === 'dark' ? (
        <SunIcon className="w-5 h-5" />
      ) : (
        <MoonIcon className="w-5 h-5" />
      )}
    </button>
  );
}

// Dropdown with Light/Dark/System options
export function ThemeDropdown({ className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const options = [
    { value: 'light' as const, label: 'สว่าง', icon: SunIcon },
    { value: 'dark' as const, label: 'มืด', icon: MoonIcon },
    { value: 'system' as const, label: 'ตามระบบ', icon: MonitorIcon },
  ];

  return (
    <div className={`relative group ${className}`}>
      <button
        className="
          p-2.5 rounded-xl transition-all duration-200
          bg-slate-100 dark:bg-slate-800
          hover:bg-slate-200 dark:hover:bg-slate-700
          text-slate-600 dark:text-slate-300
          border border-slate-200 dark:border-slate-700
        "
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? (
          <MoonIcon className="w-5 h-5" />
        ) : (
          <SunIcon className="w-5 h-5" />
        )}
      </button>
      
      {/* Dropdown Menu */}
      <div className="
        absolute right-0 mt-2 w-36 py-1
        bg-white dark:bg-slate-800
        border border-slate-200 dark:border-slate-700
        rounded-xl shadow-lg
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all duration-200
        z-50
      ">
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-sm
                transition-colors duration-150
                ${isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{option.label}</span>
              {isActive && (
                <span className="ml-auto w-2 h-2 rounded-full bg-blue-500"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Switch Style Toggle
export function ThemeSwitch({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-14 h-8 rounded-full p-1
        transition-colors duration-300
        ${isDark ? 'bg-blue-600' : 'bg-slate-300'}
        ${className}
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div
        className={`
          absolute top-1 w-6 h-6 rounded-full
          bg-white shadow-md
          flex items-center justify-center
          transition-transform duration-300
          ${isDark ? 'translate-x-6' : 'translate-x-0'}
        `}
      >
        {isDark ? (
          <MoonIcon className="w-3.5 h-3.5 text-blue-600" />
        ) : (
          <SunIcon className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>
    </button>
  );
}

export default ThemeToggle;
