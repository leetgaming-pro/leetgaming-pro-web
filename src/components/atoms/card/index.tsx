import React from "react";
import {cva, VariantProps} from "class-variance-authority";
import {cn} from "@/lib/utils";

const variants = cva(
  'rounded-large flex flex-col overflow-hidden',{
  variants: {
    variant: {
      elevated: 'bg-content1 shadow-small',
      filed: 'bg-surface',
      outlined: 'bg-transparent border border-border',
    },
  },
  defaultVariants: {
    variant: 'elevated',
  }
});

export interface ICardProps extends React.BaseHTMLAttributes<HTMLDivElement>, VariantProps<typeof variants>{
  children: React.ReactNode,
}
export default function Card({children, className, variant}: ICardProps) {
  return (
    <div className={cn(variants({ className, variant  }))}>{children}</div>
  );
}
