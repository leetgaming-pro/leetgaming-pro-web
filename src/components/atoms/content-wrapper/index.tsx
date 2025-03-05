import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const styles = cva('max-w-screen-2xl w-full flex flex-col');
export type ContentWrapperProps<T extends React.ElementType = 'section'> = {
  as?: React.ElementType;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T> & VariantProps<typeof styles>;
function ContentWrapper({
  as: Component = 'section',
  children, className, ...rest
}: ContentWrapperProps) {
  return (
    <Component className={cn(styles({ className }))} {...rest}>
      {children}
    </Component>
  );
};

export default ContentWrapper;
