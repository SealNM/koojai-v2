'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  leftIcon,
  rightIcon,
  error,
  label,
  className = '',
  disabled,
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      <div className={cn(
        "relative flex items-center transition-all duration-200",
        "bg-secondary/50 focus-within:bg-background",
        "border border-transparent focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10",
        "rounded-2xl overflow-hidden",
        error && "border-destructive focus-within:border-destructive/50 focus-within:ring-destructive/10",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        {leftIcon && (
          <div className="pl-4 text-muted-foreground flex items-center justify-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-transparent p-4 text-foreground placeholder:text-muted-foreground focus:outline-none",
            leftIcon ? "pl-3" : "",
            rightIcon ? "pr-3" : "",
            className
          )}
          disabled={disabled}
          {...props}
        />
        {rightIcon && (
          <div className="pr-4 text-muted-foreground flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive font-medium pl-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  error,
  label,
  className = '',
  disabled,
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-secondary/50 p-4 text-foreground placeholder:text-muted-foreground",
          "border border-transparent focus:border-primary/50 focus:ring-4 focus:ring-primary/10",
          "rounded-2xl resize-y min-h-[100px] focus:outline-none transition-all duration-200",
           error && "border-destructive focus:border-destructive/50 focus:ring-destructive/10",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={disabled}
        {...props}
      />
      {error && (
         <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive font-medium pl-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

