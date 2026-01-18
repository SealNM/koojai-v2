'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon } from './Icons';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const sizeStyles = {
    sm: 'w-12 h-7',
    md: 'w-14 h-8',
    lg: 'w-16 h-9',
  };

  const dotSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const translateAmounts = {
    sm: 20,
    md: 24,
    lg: 28,
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-slate-600 dark:text-brand-gray">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
      <button
        onClick={toggleTheme}
        className={`
          ${sizeStyles[size]}
          relative rounded-full transition-colors duration-300
          ${isDark ? 'bg-brand-purple' : 'bg-slate-300'}
        `}
        aria-label="Toggle theme"
      >
        <motion.div
          animate={{ x: isDark ? translateAmounts[size] : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`
            ${dotSizes[size]}
            absolute top-1 left-0
            bg-white rounded-full shadow-md
            flex items-center justify-center
          `}
        >
          {isDark ? (
            <MoonIcon className="w-3.5 h-3.5 text-brand-purple" />
          ) : (
            <SunIcon className="w-3.5 h-3.5 text-orange-500" />
          )}
        </motion.div>
      </button>
    </div>
  );
};

// Simple Icon Toggle (for header/navbar)
export const ThemeIconToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`
        w-10 h-10 rounded-full 
        flex items-center justify-center 
        transition-colors duration-200
        ${isDark 
          ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' 
          : 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30'
        }
        ${className}
      `}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <MoonIcon className="w-5 h-5" />
      ) : (
        <SunIcon className="w-5 h-5" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;
