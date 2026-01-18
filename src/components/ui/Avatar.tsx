'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  showStatus = false,
  status = 'online',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-3xl',
  };

  const statusSizes = {
    sm: 'w-2 h-2 -bottom-0 -right-0',
    md: 'w-2.5 h-2.5 -bottom-0 -right-0',
    lg: 'w-3 h-3 bottom-0 right-0',
    xl: 'w-4 h-4 bottom-0.5 right-0.5',
  };

  const statusColors = {
    online: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]',
    offline: 'bg-slate-400',
    busy: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className={`relative ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`
          ${sizeStyles[size]}
          rounded-full overflow-hidden
          flex items-center justify-center
          font-bold text-white
          bg-gradient-to-br from-brand-purple to-brand-lime
          border-2 border-white dark:border-brand-dark
          shadow-lg
        `}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
      </motion.div>

      {showStatus && (
        <span
          className={`
            absolute ${statusSizes[size]}
            ${statusColors[status]}
            rounded-full
            border-2 border-white dark:border-brand-dark
          `}
        />
      )}
    </div>
  );
};

// Emoji Avatar (for characters)
interface EmojiAvatarProps {
  emoji: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const EmojiAvatar: React.FC<EmojiAvatarProps> = ({
  emoji,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-20 h-20 text-4xl',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`
        ${sizeStyles[size]}
        rounded-2xl
        flex items-center justify-center
        bg-gradient-to-br from-brand-purple/20 to-brand-lime/30
        border border-brand-purple/20
        ${className}
      `}
    >
      {emoji}
    </motion.div>
  );
};

export default Avatar;
