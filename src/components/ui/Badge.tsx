'use client';

import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  children,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  const variants = {
    default: 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white/70',
    primary: 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30',
    success: 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30',
    info: 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-full
        ${sizeStyles[size]}
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
