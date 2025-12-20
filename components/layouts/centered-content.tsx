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
  maxWidth = '7xl',
  className = '',
  noPadding = false,
}: CenteredContentProps) {
  const maxWidthClasses: Record<string, string> = {
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

  const paddingClasses = noPadding ? '' : 'py-8 lg:py-12 xl:py-16';

  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 ${maxWidthClasses[maxWidth]} ${paddingClasses} ${className}`}>
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
  maxWidth = '7xl',
  className = '',
}: PageContainerProps) {
  return (
    <CenteredContent maxWidth={maxWidth} className={className}>
      {title && (
        <div className="mb-8 lg:mb-12 xl:mb-16 flex flex-col items-center gap-2 lg:gap-4 text-center">
          <h1 className="text-4xl font-bold lg:text-5xl xl:text-6xl">{title}</h1>
          {description && (
            <p className="text-lg lg:text-xl text-default-600 max-w-2xl lg:max-w-3xl">{description}</p>
          )}
        </div>
      )}
      {children}
    </CenteredContent>
  );
}
