'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { useTheme } from 'next-themes';
import { EsportsButton } from '@/components/ui/esports-button';
import Link from 'next/link';

interface PageHeaderAction {
  label: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'action' | 'ghost';
}

interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
  actions?: PageHeaderAction[];
}

/**
 * LeetGaming Branded Page Header
 * 
 * Standard header pattern used across all pages:
 * - Icon container with diagonal clip-path and brand gradient
 * - Title with brand colors (navy in light mode, cream in dark)
 * - Optional subtitle
 * - Action buttons on the right
 * 
 * Based on Cloud page header - the reference standard.
 */
export function PageHeader({ icon, title, subtitle, actions }: PageHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div className="flex items-center gap-4">
        {/* Icon Container - Brand standard */}
        <div 
          className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
        >
          <Icon 
            icon={icon} 
            className="text-[#F5F0E1] dark:text-[#1a1a1a]" 
            width={28} 
          />
        </div>
        {/* Title & Subtitle */}
        <div>
          <h1 className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[#34445C]/60 dark:text-[#F5F0E1]/60">{subtitle}</p>
          )}
        </div>
      </div>
      
      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action, index) => {
            const button = (
              <EsportsButton 
                key={index}
                variant={action.variant || 'action'} 
                size="md"
                onClick={action.onClick}
              >
                {action.icon && <Icon icon={action.icon} width={18} />}
                {action.label}
              </EsportsButton>
            );

            if (action.href) {
              return (
                <Link key={index} href={action.href}>
                  {button}
                </Link>
              );
            }

            return button;
          })}
        </div>
      )}
    </div>
  );
}

export default PageHeader;

