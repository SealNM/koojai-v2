'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'switch';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'icon',
}) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  if (!mounted) {
    return <div className={cn("w-9 h-9", className)} />; 
  }

  if (variant === 'switch') {
     return (
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn(
             "relative h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-800 p-1 flex items-center cursor-pointer transition-colors border border-slate-300 dark:border-slate-700",
             className
          )}
        >
           <motion.div 
             className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-600 rounded-lg shadow-sm"
             animate={{ 
                 x: theme === 'dark' ? '100%' : '0%'
             }}
             transition={{ type: "spring", stiffness: 400, damping: 30 }}
           />
           <div className="flex-1 flex items-center justify-center relative z-10 gap-2 text-xs font-medium text-slate-700 dark:text-slate-400">
               <Sun className="w-4 h-4" />
               <span className="hidden sm:inline">Light</span>
           </div>
           <div className="flex-1 flex items-center justify-center relative z-10 gap-2 text-xs font-medium text-slate-400 dark:text-slate-200">
               <Moon className="w-4 h-4" />
               <span className="hidden sm:inline">Dark</span>
           </div>
        </button>
     )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        "relative p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors w-10 h-10 flex items-center justify-center",
        className
      )}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="h-5 w-5 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
      <span className="sr-only">Toggle theme</span>
    </motion.button>
  );
};
