'use client';

/**
 * 404 Not Found Page
 * Branded error page for LeetGaming.PRO
 */

import React from 'react';
import { Button } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import NextLink from 'next/link';
import { electrolize } from '@/config/fonts';
import { cn } from '@nextui-org/react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#34445C]/10 via-transparent to-[#FF4654]/10 dark:from-[#1a1a1a] dark:via-[#0a0a0a] dark:to-[#1a1a1a]" />
      
      {/* Decorative grid pattern */}
      <div 
        className="absolute inset-0 opacity-5 dark:opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #34445C 1px, transparent 1px),
            linear-gradient(to bottom, #34445C 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF4654]/20 dark:bg-[#DCFF37]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFC700]/20 dark:bg-[#DCFF37]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* 404 Number with glitch effect */}
        <div className="relative mb-8">
          <h1 
            className={cn(
              "text-[150px] sm:text-[200px] font-black leading-none",
              "bg-gradient-to-br from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#DCFF37] dark:via-[#34445C] dark:to-[#DCFF37]",
              "bg-clip-text text-transparent",
              "drop-shadow-2xl",
              electrolize.className
            )}
          >
            404
          </h1>
          
          {/* Glitch layers */}
          <h1 
            className={cn(
              "absolute top-0 left-0 text-[150px] sm:text-[200px] font-black leading-none",
              "text-[#FF4654]/30 dark:text-[#DCFF37]/30",
              "animate-pulse",
              electrolize.className
            )}
            style={{ transform: 'translate(-2px, 2px)' }}
          >
            404
          </h1>
        </div>
        
        {/* Message */}
        <div className="mb-8">
          <h2 
            className={cn(
              "text-2xl sm:text-3xl font-bold mb-4 uppercase tracking-widest",
              "text-[#34445C] dark:text-[#F5F0E1]",
              electrolize.className
            )}
          >
            Player Not Found
          </h2>
          <p className="text-lg text-[#34445C]/70 dark:text-[#F5F0E1]/70 max-w-md mx-auto">
            Looks like you wandered off the map! The page you&apos;re looking for has been moved, deleted, or never existed.
          </p>
        </div>
        
        {/* Icon */}
        <div className="mb-8">
          <div 
            className="w-24 h-24 mx-auto flex items-center justify-center"
            style={{ 
              clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)',
              background: 'linear-gradient(135deg, rgba(255,70,84,0.1), rgba(255,199,0,0.1))'
            }}
          >
            <Icon 
              icon="solar:ghost-bold-duotone" 
              className="w-12 h-12 text-[#FF4654] dark:text-[#DCFF37] animate-bounce" 
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            as={NextLink}
            href="/"
            size="lg"
            className={cn(
              "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
              "text-white dark:text-[#1a1a1a] font-bold",
              "rounded-none px-8",
              "hover:opacity-90 transition-opacity"
            )}
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
            startContent={<Icon icon="solar:home-2-bold" className="w-5 h-5" />}
          >
            Return Home
          </Button>
          
          <Button
            as={NextLink}
            href="/match-making"
            size="lg"
            variant="bordered"
            className={cn(
              "border-2 border-[#34445C] dark:border-[#DCFF37]",
              "text-[#34445C] dark:text-[#DCFF37] font-bold",
              "rounded-none px-8",
              "hover:bg-[#34445C]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
            )}
            startContent={<Icon icon="solar:gamepad-bold" className="w-5 h-5" />}
          >
            Play Now
          </Button>
        </div>
        
        {/* Helpful links */}
        <div className="mt-12 pt-8 border-t border-[#34445C]/20 dark:border-[#DCFF37]/20">
          <p className="text-sm text-[#34445C]/50 dark:text-[#F5F0E1]/50 mb-4">
            Here are some helpful links:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <NextLink 
              href="/tournaments" 
              className="text-[#FF4654] dark:text-[#DCFF37] hover:underline flex items-center gap-1"
            >
              <Icon icon="solar:cup-star-bold" className="w-4 h-4" />
              Tournaments
            </NextLink>
            <NextLink 
              href="/players" 
              className="text-[#FF4654] dark:text-[#DCFF37] hover:underline flex items-center gap-1"
            >
              <Icon icon="solar:users-group-rounded-bold" className="w-4 h-4" />
              Players
            </NextLink>
            <NextLink 
              href="/teams" 
              className="text-[#FF4654] dark:text-[#DCFF37] hover:underline flex items-center gap-1"
            >
              <Icon icon="solar:users-group-two-rounded-bold" className="w-4 h-4" />
              Teams
            </NextLink>
            <NextLink 
              href="/cloud" 
              className="text-[#FF4654] dark:text-[#DCFF37] hover:underline flex items-center gap-1"
            >
              <Icon icon="solar:cloud-bold" className="w-4 h-4" />
              Cloud
            </NextLink>
            <NextLink 
              href="/docs" 
              className="text-[#FF4654] dark:text-[#DCFF37] hover:underline flex items-center gap-1"
            >
              <Icon icon="solar:book-bold" className="w-4 h-4" />
              Help
            </NextLink>
          </div>
        </div>
        
        {/* Error code for debugging */}
        <p className="mt-8 text-xs text-[#34445C]/30 dark:text-[#F5F0E1]/30 font-mono">
          Error Code: 404_PAGE_NOT_FOUND
        </p>
      </div>
    </div>
  );
}

