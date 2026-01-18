'use client';

import React, { forwardRef } from 'react';

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
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-600 dark:text-brand-gray mb-2">
          {label}
        </label>
      )}
      <div className={`
        bg-white dark:bg-brand-surface 
        border ${error ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} 
        rounded-2xl p-1 
        focus-within:border-brand-purple 
        transition-colors 
        shadow-sm
      `}>
        <div className="flex items-center px-4">
          {leftIcon && (
            <span className="text-slate-400 dark:text-brand-gray mr-3 shrink-0">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-transparent py-3 
              text-slate-900 dark:text-white 
              placeholder:text-slate-400 dark:placeholder:text-brand-gray/50 
              focus:outline-none font-medium
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <span className="text-slate-400 dark:text-brand-gray ml-3 shrink-0">
              {rightIcon}
            </span>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  error,
  label,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-600 dark:text-brand-gray mb-2">
          {label}
        </label>
      )}
      <div className={`
        bg-white dark:bg-brand-surface 
        border ${error ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} 
        rounded-2xl 
        focus-within:border-brand-purple 
        transition-colors 
        shadow-sm
      `}>
        <textarea
          ref={ref}
          className={`
            w-full bg-transparent p-4
            text-slate-900 dark:text-white 
            placeholder:text-slate-400 dark:placeholder:text-brand-gray/50 
            focus:outline-none font-medium resize-none
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Input;
