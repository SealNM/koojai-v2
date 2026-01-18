'use client';

/**
 * 🎨 Avatar Component
 * สำหรับแสดงรูปโปรไฟล์หรือไอคอนตัวแทน
 */

import { UserIcon } from './Icons';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

export default function Avatar({
  src,
  alt = '',
  name,
  size = 'md',
  status,
  className = '',
}: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5 right-0 bottom-0',
    sm: 'w-2 h-2 right-0 bottom-0',
    md: 'w-2.5 h-2.5 right-0 bottom-0',
    lg: 'w-3 h-3 right-0.5 bottom-0.5',
    xl: 'w-3.5 h-3.5 right-0.5 bottom-0.5',
    '2xl': 'w-4 h-4 right-1 bottom-1',
  };

  const statusColors = {
    online: 'bg-green-400 ring-2 ring-slate-900',
    offline: 'bg-slate-500 ring-2 ring-slate-900',
    busy: 'bg-red-400 ring-2 ring-slate-900',
    away: 'bg-amber-400 ring-2 ring-slate-900',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const gradients = [
    'from-violet-600 to-indigo-600',
    'from-pink-600 to-rose-600',
    'from-cyan-600 to-blue-600',
    'from-amber-600 to-orange-600',
    'from-emerald-600 to-green-600',
  ];

  const getGradient = (name?: string) => {
    if (!name) return gradients[0];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className={`
          ${sizes[size]}
          rounded-full overflow-hidden
          flex items-center justify-center
          bg-gradient-to-br ${getGradient(name)}
          ring-2 ring-slate-700/50
        `}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : name ? (
          <span className="font-semibold text-white">{getInitials(name)}</span>
        ) : (
          <UserIcon className="w-1/2 h-1/2 text-white/70" />
        )}
      </div>
      {status && (
        <span
          className={`
            absolute rounded-full
            ${statusSizes[size]}
            ${statusColors[status]}
          `}
        />
      )}
    </div>
  );
}

// Avatar Group
interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    name?: string;
    alt?: string;
  }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
  className = '',
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const overlapSizes = {
    xs: '-ml-2',
    sm: '-ml-2.5',
    md: '-ml-3',
    lg: '-ml-4',
  };

  const counterSizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className={`flex items-center ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className={`${index > 0 ? overlapSizes[size] : ''}`}
          style={{ zIndex: visibleAvatars.length - index }}
        >
          <Avatar {...avatar} size={size} />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            ${overlapSizes[size]}
            ${counterSizes[size]}
            rounded-full
            bg-slate-700 border-2 border-slate-800
            flex items-center justify-center
            font-semibold text-slate-300
          `}
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
