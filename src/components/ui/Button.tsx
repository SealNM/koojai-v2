'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { LoaderIcon } from './Icons';

/**
 * 🎨 Button Component
 * Base button component สำหรับใช้ทั่วทั้งแอป
 */

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center font-semibold
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 
      focus:ring-offset-white dark:focus:ring-offset-slate-900
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
    `;

    const variants = {
      primary: `
        bg-blue-500 text-white
        hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/25
        focus:ring-blue-500
      `,
      secondary: `
        bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white
        hover:bg-slate-300 dark:hover:bg-slate-600 hover:shadow-lg
        focus:ring-slate-400
      `,
      outline: `
        bg-transparent border-2 border-slate-300 dark:border-slate-600 
        text-slate-700 dark:text-slate-300
        hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400
        focus:ring-blue-500
      `,
      ghost: `
        bg-transparent text-slate-600 dark:text-slate-400
        hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white
        focus:ring-slate-500
      `,
      danger: `
        bg-red-500 text-white
        hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25
        focus:ring-red-500
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
      md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
      lg: 'px-6 py-3 text-base rounded-xl gap-2',
      xl: 'px-8 py-4 text-lg rounded-2xl gap-3',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <LoaderIcon className="w-4 h-4" />
            <span>กำลังโหลด...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Named exports
export { Button };
export default Button;

// IconButton for icon-only buttons
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center
      transition-all duration-200 ease-out rounded-xl
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.95]
    `;

    const variants = {
      primary: `
        bg-[#CCFF00] text-slate-900
        hover:bg-[#b8e600]
        focus:ring-[#CCFF00]
      `,
      secondary: `
        bg-violet-600 text-white
        hover:bg-violet-500
        focus:ring-violet-500
      `,
      outline: `
        bg-transparent border-2 border-slate-600 text-slate-400
        hover:border-slate-500 hover:bg-slate-800/50 hover:text-white
        focus:ring-slate-500
      `,
      ghost: `
        bg-transparent text-slate-400
        hover:bg-slate-800/50 hover:text-white
        focus:ring-slate-500
      `,
      danger: `
        bg-red-600/10 text-red-400
        hover:bg-red-600/20 hover:text-red-300
        focus:ring-red-500
      `,
    };

    const sizes = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? <LoaderIcon className="w-5 h-5" /> : children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
