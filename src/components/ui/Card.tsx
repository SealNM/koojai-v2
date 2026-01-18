'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: 'default' | 'glass' | 'gradient' | 'surface';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
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
    default: 'bg-card text-card-foreground border shadow-sm',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-lg',
    gradient: 'bg-gradient-to-br from-primary/10 to-secondary/10 border-none shadow-md',
    surface: 'bg-secondary text-secondary-foreground border-none',
  };

  return (
    <motion.div
      className={cn(
        "rounded-3xl overflow-hidden transition-all duration-200",
        variants[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
