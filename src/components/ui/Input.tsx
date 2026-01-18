'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useState } from 'react';
import { EyeIcon, EyeOffIcon, SearchIcon } from './Icons';

/**
 * 🎨 Input Components
 * Base input components สำหรับใช้ทั่วทั้งแอป
 */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className = '',
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full px-4 py-3.5
              bg-white dark:bg-slate-800/50 
              border-2 border-slate-200 dark:border-slate-700/50
              rounded-xl
              text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
              transition-all duration-200
              focus:outline-none focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-800
              focus:ring-2 focus:ring-blue-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-12' : ''}
              ${rightIcon || isPassword ? 'pr-12' : ''}
              ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
          {rightIcon && !isPassword && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>
        {hint && !error && (
          <p className="mt-2 text-sm text-slate-500">{hint}</p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Named export
export { Input };
export default Input;

// Search Input
interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className = '', onSearch, ...props }, ref) => {
    return (
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
        <input
          ref={ref}
          type="search"
          className={`
            w-full pl-12 pr-4 py-3
            bg-white dark:bg-slate-800/50 
            border-2 border-slate-200 dark:border-slate-700/50
            rounded-xl
            text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
            transition-all duration-200
            focus:outline-none focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-800
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

// Textarea
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3.5
            bg-white dark:bg-slate-800/50 
            border-2 border-slate-200 dark:border-slate-700/50
            rounded-xl
            text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
            transition-all duration-200
            focus:outline-none focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-800
            focus:ring-2 focus:ring-blue-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
            ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {hint && !error && (
          <p className="mt-2 text-sm text-slate-500">{hint}</p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Chat Input (special styling for chat interface)
interface ChatInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onSend?: () => void;
  isSending?: boolean;
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  ({ className = '', onSend, isSending, ...props }, ref) => {
    return (
      <div className="relative flex items-center gap-3">
        <input
          ref={ref}
          type="text"
          className={`
            flex-1 px-5 py-4
            bg-white dark:bg-slate-800/80 
            border-2 border-slate-200 dark:border-slate-700/50
            rounded-2xl
            text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
            transition-all duration-200
            focus:outline-none focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-800
            ${className}
          `}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && onSend) {
              e.preventDefault();
              onSend();
            }
          }}
          {...props}
        />
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';
