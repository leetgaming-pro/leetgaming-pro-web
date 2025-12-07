'use client';

import React from 'react';
import clsx from 'clsx';

export type EsportsButtonVariant = 'primary' | 'action' | 'ghost' | 'danger' | 'matchmaking';
export type EsportsButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'nav';

interface EsportsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: EsportsButtonVariant;
  size?: EsportsButtonSize;
  glow?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  as?: 'button' | 'a';
  href?: string;
}

const sizeClasses: Record<EsportsButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  xl: 'h-14 px-8 text-lg',
  nav: 'h-9 px-4 text-sm',
};

export const EsportsButton = React.forwardRef<HTMLButtonElement, EsportsButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      glow = false,
      fullWidth = false,
      loading = false,
      children,
      className,
      disabled,
      as = 'button',
      href,
      ...props
    },
    ref
  ) => {
    const baseClasses = clsx(
      'esports-btn',
      `esports-btn-${variant}`,
      sizeClasses[size],
      'inline-flex items-center justify-center gap-2',
      'font-semibold uppercase tracking-wide',
      'transition-all duration-200',
      'border-0 outline-none',
      'relative overflow-hidden',
      glow && 'esports-btn-glow',
      fullWidth && 'w-full',
      disabled && 'opacity-50 cursor-not-allowed',
      loading && 'pointer-events-none',
      className
    );

    const content = (
      <>
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </>
    );

    if (as === 'a' && href) {
      return (
        <a href={href} className={baseClasses}>
          {content}
        </a>
      );
    }

    return (
      <button ref={ref} className={baseClasses} disabled={disabled || loading} {...props}>
        {content}
      </button>
    );
  }
);

EsportsButton.displayName = 'EsportsButton';

export default EsportsButton;
