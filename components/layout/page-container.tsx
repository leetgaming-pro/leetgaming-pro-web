/**
 * Page Container Component
 * Standardized responsive container with consistent padding
 * Fixes the "content glued to left" issue across all pages
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { pageTransitions, springs } from "@/lib/design/animations";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  center?: boolean;
  animate?: boolean;
  animationVariant?: "fade" | "slideUp" | "slideDown" | "scale";
}

export function PageContainer({
  children,
  className = "",
  maxWidth = "xl",
  padding = "md",
  center = true,
  animate = true,
  animationVariant = "fade",
}: PageContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  const maxWidthClasses = {
    sm: "max-w-screen-sm", // 640px
    md: "max-w-screen-md", // 768px
    lg: "max-w-screen-lg", // 1024px
    xl: "max-w-screen-xl", // 1280px
    "2xl": "max-w-screen-2xl", // 1536px
    "7xl": "max-w-[1920px]",
    full: "max-w-full",
  };

  const paddingClasses = {
    none: "",
    sm: "px-4 md:px-6",
    md: "px-4 md:px-6 lg:px-8",
    lg: "px-4 md:px-8 lg:px-12",
  };

  const centerClasses = center ? "mx-auto" : "";

  const containerClasses = `
    w-full
    ${maxWidthClasses[maxWidth]}
    ${paddingClasses[padding]}
    ${centerClasses}
    ${className}
  `.trim();

  if (!animate || prefersReducedMotion) {
    return <div className={containerClasses}>{children}</div>;
  }

  const variants = pageTransitions[animationVariant] || pageTransitions.slideUp;

  return (
    <motion.div
      className={containerClasses}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={springs.gentle}
    >
      {children}
    </motion.div>
  );
}

// Section wrapper with optional background and spacing
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: "default" | "subtle" | "transparent";
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  rounded?: boolean;
  id?: string;
}

export function Section({
  children,
  className = "",
  background = "transparent",
  spacing = "md",
  rounded = false,
  id,
}: SectionProps) {
  const backgroundClasses = {
    default: "bg-background",
    subtle: "bg-default-50",
    transparent: "",
  };

  const spacingClasses = {
    none: "",
    sm: "py-4",
    md: "py-8",
    lg: "py-12",
    xl: "py-16",
  };

  const roundedClass = rounded ? "rounded-lg" : "";

  return (
    <section
      id={id}
      className={`
        ${backgroundClasses[background]}
        ${spacingClasses[spacing]}
        ${roundedClass}
        ${className}
      `.trim()}
    >
      {children}
    </section>
  );
}

// Grid container with responsive columns
interface GridContainerProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "none" | "sm" | "md" | "lg" | "xl";
}

export function GridContainer({
  children,
  className = "",
  columns = { default: 1, md: 2, lg: 3, xl: 4 },
  gap = "md",
}: GridContainerProps) {
  const columnClasses = `
    grid
    grid-cols-${columns.default || 1}
    ${columns.sm ? `sm:grid-cols-${columns.sm}` : ""}
    ${columns.md ? `md:grid-cols-${columns.md}` : ""}
    ${columns.lg ? `lg:grid-cols-${columns.lg}` : ""}
    ${columns.xl ? `xl:grid-cols-${columns.xl}` : ""}
  `.trim();

  const gapClasses = {
    none: "gap-0",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  return (
    <div className={`${columnClasses} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

// Content wrapper with max-width for reading
interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
  prose?: boolean;
}

export function ContentWrapper({
  children,
  className = "",
  prose = false,
}: ContentWrapperProps) {
  const proseClass = prose ? "prose prose-lg dark:prose-invert max-w-none" : "";

  return (
    <div className={`max-w-3xl mx-auto ${proseClass} ${className}`}>
      {children}
    </div>
  );
}

// Centered content (for landing pages, auth pages)
interface CenteredContentProps {
  children: React.ReactNode;
  className?: string;
  verticalCenter?: boolean;
}

export function CenteredContent({
  children,
  className = "",
  verticalCenter = false,
}: CenteredContentProps) {
  const verticalClass = verticalCenter ? "min-h-screen" : "";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${verticalClass} ${className}`}
    >
      {children}
    </div>
  );
}

// Flex container with common patterns
interface FlexContainerProps {
  children: React.ReactNode;
  className?: string;
  direction?: "row" | "column";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  wrap?: boolean;
}

export function FlexContainer({
  children,
  className = "",
  direction = "row",
  align = "start",
  justify = "start",
  gap = "md",
  wrap = false,
}: FlexContainerProps) {
  const directionClass = direction === "column" ? "flex-col" : "flex-row";

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  };

  const gapClasses = {
    none: "gap-0",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  const wrapClass = wrap ? "flex-wrap" : "";

  return (
    <div
      className={`
        flex
        ${directionClass}
        ${alignClasses[align]}
        ${justifyClasses[justify]}
        ${gapClasses[gap]}
        ${wrapClass}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
}

// Stack (vertical spacing helper)
interface StackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Stack({
  children,
  className = "",
  spacing = "md",
}: StackProps) {
  const spacingClasses = {
    none: "space-y-0",
    xs: "space-y-1",
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6",
    xl: "space-y-8",
    "2xl": "space-y-12",
  };

  return (
    <div className={`${spacingClasses[spacing]} ${className}`}>{children}</div>
  );
}

// Inline (horizontal spacing helper)
interface InlineProps {
  children: React.ReactNode;
  className?: string;
  spacing?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  wrap?: boolean;
}

export function Inline({
  children,
  className = "",
  spacing = "md",
  wrap = true,
}: InlineProps) {
  const spacingClasses = {
    none: "gap-0",
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  const wrapClass = wrap ? "flex-wrap" : "";

  return (
    <div
      className={`flex ${spacingClasses[spacing]} ${wrapClass} ${className}`}
    >
      {children}
    </div>
  );
}
