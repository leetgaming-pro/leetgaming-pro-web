import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variants = cva(
  '',
  {
    variants: {
      variant: {
        default: 'text-text-primary',
        light: 'text-text-secondary',
        error: 'text-danger',
        gray: 'text-neutral-gray-200',
        primary: 'text-primary',
        secondary: 'text-secondary',
        white: 'text-neutral-white',
        black: 'text-neutral-black',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      type: {
        h1: 'text-h1',
        h2: 'text-h2',
        h3: 'text-h3',
        h4: 'text-h4',
        h5: 'text-h5',
        h6: 'text-h6',
        p: 'text-body',
        span: 'text-body',
      },
      size: {
        xs: 'text-[0.5rem] lg:text-sm', /* 8px - 14px */
        sm: 'text-xs lg:text-sm', /* 12px - 14px */
        md: 'text-sm lg:text-base', /* 14px - 16px */
        lg: 'text-3xl', /* 30px */
        xl: 'text-2xl lg:text-4xl', /* 24px - 36px */
        h1: 'text-h1',
        h2: 'text-h2',
        h3: 'text-h3',
        h4: 'text-h4',
        h5: 'text-h5',
        h6: 'text-h6',
        body: 'text-body',
        bodySmall: 'text-bodySmall',
        caption: 'text-caption',
      },
      weight: {
        semibold: 'font-semibold', /* 600 */
        normal: 'font-normal', /* 400 */
      },
    },
    defaultVariants: {
      variant: 'default',
      type: 'p',
    },
  },
);
export interface ITypographyProps extends React.BaseHTMLAttributes<HTMLSpanElement>,
  VariantProps<typeof variants> {
  children: React.ReactNode
}

export default function Typography({
 children, size, weight, variant, type, className, ...rest
}: ITypographyProps) {
  const Text = type || 'p';

  return (
    <Text
      className={cn(variants({
        variant, size, weight, type, className,
      }))}
      {...rest}
    >
      {children}
    </Text>
  );
}
