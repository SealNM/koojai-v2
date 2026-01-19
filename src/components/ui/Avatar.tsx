'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'busy';
  className?: string;
  icon?: React.ReactNode;
}

// Helper to check if string is emoji
function isEmoji(str: string): boolean {
  if (!str) return false;
  // Check if string contains emoji characters
  const emojiRegex = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u;
  return emojiRegex.test(str.trim());
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  showStatus = false,
  status = 'online',
  className = '',
  icon,
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-20 h-20 text-4xl',
    '2xl': 'w-32 h-32 text-6xl',
  };

  const statusSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  const statusColors = {
    online: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]',
    offline: 'bg-muted-foreground',
    busy: 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]',
  };

  const initial = name ? name.charAt(0).toUpperCase() : null;
  const srcIsEmoji = src && isEmoji(src);

  return (
    <div className={cn("relative inline-block", className)}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={cn(
            sizeStyles[size],
            "rounded-full overflow-hidden flex items-center justify-center font-bold shadow-lg",
            srcIsEmoji 
              ? "bg-gradient-to-br from-primary/20 to-secondary text-foreground"
              : "bg-gradient-to-br from-primary to-primary/60 text-primary-foreground"
        )}
      >
        {src && !srcIsEmoji ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : srcIsEmoji ? (
          <span className="leading-none">{src}</span>
        ) : icon ? (
           icon
        ) : initial ? (
          <span>{initial}</span>
        ) : (
          <User className="w-1/2 h-1/2" />
        )}
      </motion.div>

      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background",
            statusSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};

// Deprecated: Use Avatar with icon prop if needed, primarily for compatibility
export const EmojiAvatar: React.FC<{ emoji: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
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
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        sizeStyles[size],
        "rounded-full bg-secondary flex items-center justify-center shadow-sm select-none",
        className
      )}
    >
      {emoji}
    </motion.div>
  );
};
