'use client';

/**
 * BreadcrumbBar Component
 * A branded breadcrumb that extends from the navbar's active state
 * - PLAY/Match-making: Navy background with white text (light) / Lime with dark text (dark)
 * - Other pages: Gradient accent bar similar to "Host tournament" banner
 */

import React from 'react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { electrolize } from '@/config/fonts';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: string;
}

// Route configurations for breadcrumb generation
const routeConfig: Record<string, { label: string; icon: string; parent?: string }> = {
  '/': { label: 'Home', icon: 'solar:home-2-bold' },
  '/match-making': { label: 'Play', icon: 'solar:gamepad-bold' },
  '/players': { label: 'Players', icon: 'solar:users-group-rounded-bold' },
  '/teams': { label: 'Teams', icon: 'solar:users-group-two-rounded-bold' },
  '/tournaments': { label: 'Tournaments', icon: 'solar:cup-star-bold' },
  '/cloud': { label: 'Cloud', icon: 'solar:cloud-bold' },
  '/upload': { label: 'Upload', icon: 'solar:upload-bold', parent: '/cloud' },
  '/replays': { label: 'Replays', icon: 'solar:play-circle-bold', parent: '/cloud' },
  '/highlights': { label: 'Highlights', icon: 'solar:star-bold', parent: '/cloud' },
  '/leaderboards': { label: 'Leaderboards', icon: 'solar:ranking-bold' },
  '/settings': { label: 'Settings', icon: 'solar:settings-bold' },
  '/wallet': { label: 'Wallet', icon: 'solar:wallet-bold' },
  '/pricing': { label: 'Pricing', icon: 'solar:tag-price-bold' },
  '/blog': { label: 'Blog', icon: 'solar:document-text-bold' },
  '/about': { label: 'About', icon: 'solar:info-circle-bold' },
  '/docs': { label: 'Docs', icon: 'solar:book-bold' },
  '/supply': { label: 'Supply', icon: 'solar:box-bold' },
  '/ranked': { label: 'Ranked', icon: 'solar:medal-ribbons-star-bold' },
  '/admin': { label: 'Admin', icon: 'solar:shield-user-bold' },
  '/signin': { label: 'Sign In', icon: 'solar:login-bold' },
  '/signup': { label: 'Sign Up', icon: 'solar:user-plus-bold' },
  '/checkout': { label: 'Checkout', icon: 'solar:cart-check-bold' },
  '/search': { label: 'Search', icon: 'solar:magnifer-bold' },
  '/notifications': { label: 'Notifications', icon: 'solar:bell-bold' },
};

// Special pages that get the "primary" (Play/Match-making) treatment
const primaryPages = ['/match-making', '/ranked'];

// Cloud pages get their own unique styling (matches Cloud navbar)
const cloudPages = ['/cloud', '/upload', '/replays', '/highlights'];

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  
  // Always start with Home for non-home pages
  if (pathname !== '/') {
    items.push({ label: 'Home', href: '/', icon: 'solar:home-2-bold' });
  }

  // Handle dynamic routes (e.g., /players/[id], /tournaments/[id])
  const segments = pathname.split('/').filter(Boolean);
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const config = routeConfig[currentPath];

    if (config) {
      // Check if there's a parent route we should add first
      if (config.parent && !items.find(item => item.href === config.parent)) {
        const parentConfig = routeConfig[config.parent];
        if (parentConfig) {
          items.push({
            label: parentConfig.label,
            href: config.parent,
            icon: parentConfig.icon,
          });
        }
      }

      items.push({
        label: config.label,
        href: currentPath,
        icon: config.icon,
      });
    } else {
      // Handle dynamic segments (IDs)
      // Check if this looks like an ID (UUID or slug)
      if (segments[i].match(/^[a-f0-9-]{36}$|^[a-z0-9-]+$/i)) {
        items.push({
          label: 'Details',
          href: currentPath,
          icon: 'solar:document-bold',
        });
      }
    }
  }

  return items;
}

// Inner component that uses pathname
function BreadcrumbContent({ pathname }: { pathname: string }) {
  const breadcrumbs = generateBreadcrumbs(pathname);
  const isPrimaryPage = primaryPages.some(p => pathname.startsWith(p));
  const isCloudPage = cloudPages.some(p => pathname.startsWith(p));

  // Determine background and text colors based on page type
  // Cloud pages get the same style as the Cloud navbar header
  // DARK MODE PRIMARY: Gradient inverted to flow from left menu (darker) to right (brighter)
  const bgClasses = isCloudPage
    ? 'bg-gradient-to-r from-[#34445C] via-[#34445C] to-[#3d5068] dark:from-[#1a1a1a] dark:via-[#111111] dark:to-[#1a1a1a]'
    : isPrimaryPage
      ? 'bg-[#34445C] dark:bg-gradient-to-r dark:from-[#1a1a1a] dark:via-[#2a3a20] dark:to-[#DCFF37]'
      : 'bg-gradient-to-r from-[#FF4654]/10 via-[#FFC700]/10 to-[#FF4654]/10 dark:from-[#DCFF37]/10 dark:via-[#34445C]/20 dark:to-[#DCFF37]/10';

  const textClasses = isCloudPage
    ? 'text-[#F5F0E1] dark:text-[#F5F0E1]/80'
    : isPrimaryPage
      ? 'text-white dark:text-[#DCFF37]'
      : 'text-[#34445C] dark:text-[#F5F0E1]';

  const separatorClasses = isCloudPage
    ? 'text-[#DCFF37]/50 dark:text-[#DCFF37]/50'
    : isPrimaryPage
      ? 'text-white/50 dark:text-[#DCFF37]/50'
      : 'text-[#FF4654]/50 dark:text-[#DCFF37]/50';

  const hoverClasses = isCloudPage
    ? 'hover:text-[#DCFF37] dark:hover:text-[#DCFF37]'
    : isPrimaryPage
      ? 'hover:text-white/80 dark:hover:text-[#F5F0E1]'
      : 'hover:text-[#FF4654] dark:hover:text-[#DCFF37]';

  const activeClasses = isCloudPage
    ? 'text-[#DCFF37] font-semibold dark:text-[#DCFF37]'
    : isPrimaryPage
      ? 'text-white font-semibold dark:text-[#1a1a1a] dark:drop-shadow-[0_0_8px_rgba(220,255,55,0.8)]'
      : 'text-[#FF4654] font-semibold dark:text-[#DCFF37]';

  const borderClasses = isCloudPage
    ? 'border-[#DCFF37]/30 dark:border-[#DCFF37]/20'
    : isPrimaryPage
      ? 'border-[#34445C]/30 dark:border-[#DCFF37]/30'
      : 'border-[#FF4654]/20 dark:border-[#DCFF37]/20';

  return (
    <div
      className={cn(
        'w-full border-b transition-all duration-200',
        bgClasses,
        borderClasses
      )}
    >
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <nav
          aria-label="Breadcrumb"
          className={cn(
            'flex items-center gap-2 py-2 text-sm',
            electrolize.className
          )}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <React.Fragment key={`${item.href}-${index}`}>
                {index > 0 && (
                  <Icon
                    icon="solar:alt-arrow-right-linear"
                    className={cn('w-4 h-4 flex-shrink-0', separatorClasses)}
                  />
                )}
                
                {isLast ? (
                  <span
                    className={cn(
                      'flex items-center gap-1.5',
                      activeClasses
                    )}
                  >
                    {item.icon && (
                      <Icon icon={item.icon} className="w-4 h-4" />
                    )}
                    <span className="uppercase tracking-wider">{item.label}</span>
                  </span>
                ) : (
                  <NextLink
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1.5 transition-colors duration-150',
                      textClasses,
                      hoverClasses
                    )}
                  >
                    {item.icon && (
                      <Icon icon={item.icon} className="w-4 h-4 opacity-70" />
                    )}
                    <span className="uppercase tracking-wider">{item.label}</span>
                  </NextLink>
                )}
              </React.Fragment>
            );
          })}

          {/* Page action hint - shown for special pages */}
          {isPrimaryPage && (
            <div className="ml-auto flex items-center gap-2">
              <span className={cn('text-xs opacity-70', textClasses)}>
                Ready to compete
              </span>
              <Icon
                icon="solar:gamepad-bold"
                className={cn('w-4 h-4 animate-pulse', textClasses)}
              />
            </div>
          )}
          {isCloudPage && (
            <div className="ml-auto flex items-center gap-2">
              <span className={cn('text-xs opacity-70', textClasses)}>
                Manage your files
              </span>
              <Icon
                icon="solar:cloud-bold"
                className={cn('w-4 h-4', 'text-[#DCFF37]')}
              />
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}

// Main export - handles SSR safety
export function BreadcrumbBar() {
  const pathname = usePathname();

  // Don't show breadcrumb on home page or if pathname is null
  if (!pathname || pathname === '/') {
    return null;
  }

  return <BreadcrumbContent pathname={pathname} />;
}

export default BreadcrumbBar;
