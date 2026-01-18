'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: 'default' | 'glass' | 'gradient' | 'surface';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variants = {
    default: 'bg-white dark:bg-brand-surface border border-slate-200 dark:border-white/5 shadow-sm',
    glass: 'glass',
    gradient: 'bg-brand-gradient border border-brand-purple/20',
    surface: 'bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/5',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`rounded-3xl ${paddingStyles[padding]} ${variants[variant]} ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Glass Card with Gradient (like Hero Cards)
interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  gradient?: boolean;
  children?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  gradient = false,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative overflow-hidden rounded-3xl p-6
        ${gradient 
          ? 'bg-brand-gradient shadow-lg shadow-brand-purple/25' 
          : 'glass-strong'
        }
        ${className}
      `}
      {...props}
    >
      {/* Ambient glow spots */}
      {gradient && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-lime/20 rounded-full blur-2xl pointer-events-none" />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default Card;
