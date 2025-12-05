/**
 * CenteredContent Component
 * Provides consistent content centering and max-width constraints across the application
 */

import React from 'react';

interface CenteredContentProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  className?: string;
  noPadding?: boolean;
}

export function CenteredContent({
  children,
  maxWidth = '5xl',
  className = '',
  noPadding = false,
}: CenteredContentProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const paddingClasses = noPadding ? '' : 'py-8';

  return (
    <div className={`w-full ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
}

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  className?: string;
}

export function PageContainer({
  children,
  title,
  description,
  maxWidth = '5xl',
  className = '',
}: PageContainerProps) {
  return (
    <CenteredContent maxWidth={maxWidth} className={className}>
      {title && (
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <h1 className="text-4xl font-bold lg:text-5xl">{title}</h1>
          {description && (
            <p className="text-lg text-default-600 max-w-2xl">{description}</p>
          )}
        </div>
      )}
      {children}
    </CenteredContent>
  );
}
