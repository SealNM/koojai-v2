'use client';

import { HTMLAttributes, forwardRef } from 'react';

/**
 * 🎨 Card Components
 * Base card components สำหรับใช้ทั่วทั้งแอป
 */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      hover = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50',
      glass: 'bg-white/80 dark:bg-slate-800/30 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/30',
      gradient: 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-600/20 dark:to-indigo-600/20 border border-blue-200/30 dark:border-blue-500/20',
      outline: 'bg-transparent border-2 border-slate-200 dark:border-slate-700/50',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const hoverStyles = hover
      ? 'transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-0.5'
      : '';

    return (
      <div
        ref={ref}
        className={`
          rounded-2xl
          ${variants[variant]}
          ${paddings[padding]}
          ${hoverStyles}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;

// Feature Card with Icon
interface FeatureCardProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, title, description, action, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6
          transition-all duration-300 
          hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/70
          ${className}
        `}
        {...props}
      >
        {icon && (
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500 dark:text-blue-400 mb-4">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
        {description && (
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">{description}</p>
        )}
        {action}
      </div>
    );
  }
);

FeatureCard.displayName = 'FeatureCard';

// Character Card
interface CharacterCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  avatar?: string | React.ReactNode;
  description?: string;
  isActive?: boolean;
  onChat?: () => void;
  onVoice?: () => void;
}

export const CharacterCard = forwardRef<HTMLDivElement, CharacterCardProps>(
  (
    { name, avatar, description, isActive, onChat, onVoice, className = '', ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white dark:bg-slate-800/50 border rounded-2xl p-5
          transition-all duration-300 
          hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50
          ${isActive ? 'border-blue-500/50 bg-blue-50 dark:bg-blue-600/10' : 'border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'}
          ${className}
        `}
        {...props}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-600/30 dark:to-indigo-600/30 rounded-2xl flex items-center justify-center text-2xl border border-blue-200/50 dark:border-blue-500/20">
            {typeof avatar === 'string' ? avatar : avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{name}</h3>
            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{description}</p>
            )}
          </div>
        </div>
        {(onChat || onVoice) && (
          <div className="flex gap-2">
            {onChat && (
              <button
                onClick={onChat}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-blue-600/20 dark:hover:bg-blue-600/30 text-slate-700 dark:text-blue-300 rounded-xl text-sm font-medium transition-colors"
              >
                พิมพ์คุย
              </button>
            )}
            {onVoice && (
              <button
                onClick={onVoice}
                className="flex-1 py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-colors"
              >
                พูดคุย
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

CharacterCard.displayName = 'CharacterCard';

// Stats Card
interface StatsCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({ label, value, icon, trend, trendValue, className = '', ...props }, ref) => {
    const trendColors = {
      up: 'text-green-500 dark:text-green-400',
      down: 'text-red-500 dark:text-red-400',
      neutral: 'text-slate-500 dark:text-slate-400',
    };

    return (
      <div
        ref={ref}
        className={`
          bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5
          ${className}
        `}
        {...props}
      >
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
          {icon && (
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500 dark:text-blue-400">
              {icon}
            </div>
          )}
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">{value}</span>
          {trend && trendValue && (
            <span className={`text-sm ${trendColors[trend]} mb-1`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </span>
          )}
        </div>
      </div>
    );
  }
);

StatsCard.displayName = 'StatsCard';

// Glass Card (for hero sections)
interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, gradient = false, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          relative overflow-hidden rounded-3xl p-8
          ${gradient 
            ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600' 
            : 'bg-white/80 dark:bg-slate-800/30 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/30'
          }
          ${className}
        `}
        {...props}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 dark:bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 dark:bg-blue-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
