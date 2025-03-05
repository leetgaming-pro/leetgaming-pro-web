import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variants = cva(
  '',
  {
    variants: {
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
      variant: {
        default: 'text-neutral-black',
        error: 'text-danger',
        light: 'text-neutral-black-100',
        gray: 'text-neutral-gray-200',
        primary: 'text-primary',
        white: 'text-neutral-white',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'text-base lg:text-xl', /* 16px - 20px */
        xs: 'text-[0.5rem] lg:text-sm', /* 8px - 14px */
        sm: 'text-xs lg:text-sm', /* 12px - 14px */
        md: 'text-sm lg:text-base', /* 14px - 16px */
        lg: 'text-3xl', /* 30px */
        xl: 'text-2xl lg:text-4xl', /* 24px - 36px */
      },
      weight: {
        semibold: 'font-semibold', /* 600 */
        normal: 'font-normal', /* 400 */
      },
    },
    defaultVariants: {
      variant: 'default',
      weight: 'normal',
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
