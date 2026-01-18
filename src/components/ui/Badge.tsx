'use client';

/**
 * 🎨 Badge Component
 * สำหรับแสดงสถานะ หรือ label ต่างๆ
 */

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-200 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300 border-gray-300 dark:border-slate-600/50',
    primary: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    success: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const dotColors = {
    default: 'bg-gray-400 dark:bg-slate-400',
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full border
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}

// Status Badge with animation
interface StatusBadgeProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  showLabel?: boolean;
  className?: string;
}

export function StatusBadge({ status, showLabel = true, className = '' }: StatusBadgeProps) {
  const statusConfig = {
    online: {
      color: 'bg-green-400',
      ring: 'ring-green-400/30',
      label: 'ออนไลน์',
    },
    offline: {
      color: 'bg-slate-500',
      ring: 'ring-slate-500/30',
      label: 'ออฟไลน์',
    },
    busy: {
      color: 'bg-red-400',
      ring: 'ring-red-400/30',
      label: 'ไม่ว่าง',
    },
    away: {
      color: 'bg-amber-400',
      ring: 'ring-amber-400/30',
      label: 'ไม่อยู่',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`relative flex h-2.5 w-2.5`}>
        {status === 'online' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.color} ring-4 ${config.ring}`} />
      </span>
      {showLabel && (
        <span className="text-sm text-slate-400">{config.label}</span>
      )}
    </span>
  );
}

// Count Badge (for notifications)
interface CountBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

export function CountBadge({ count, max = 99, className = '' }: CountBadgeProps) {
  if (count <= 0) return null;
  
  const displayCount = count > max ? `${max}+` : count;
  
  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[20px] h-5 px-1.5
        bg-red-500 text-white text-xs font-bold
        rounded-full
        ${className}
      `}
    >
      {displayCount}
    </span>
  );
}
