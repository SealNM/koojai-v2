'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User, Sparkles } from 'lucide-react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'busy';
  className?: string;
  icon?: React.ReactNode;
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
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const statusSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const statusColors = {
    online: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]',
    offline: 'bg-muted-foreground',
    busy: 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]',
  };

  const initial = name ? name.charAt(0).toUpperCase() : null;

  return (
    <div className={cn("relative inline-block", className)}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={cn(
            sizeStyles[size],
            "rounded-full overflow-hidden flex items-center justify-center font-bold text-primary-foreground",
            "bg-gradient-to-br from-primary to-primary/60",
            "border-2 border-background shadow-lg"
        )}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
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
