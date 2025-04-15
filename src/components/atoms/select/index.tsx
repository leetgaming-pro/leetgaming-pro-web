import React, { type SelectHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const selectVariants = cva(
  'w-full appearance-none rounded-lg placeholder:text-text-secondary text-base text-bodySmall text-neutral-black bg-surface py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default',
  {
    variants: {
      variant: {
        active: 'border-primary',
        error: 'border-danger',
      },
      spacing: {
        default: 'p-5 lg:p-4',
        md: 'p-5 lg:p-6',
      },
      icons: {
        none: '',
        right: 'pr-14 lg:pr-[6.5rem]',
      },
    },
    defaultVariants: {
      spacing: 'default',
      icons: 'none',
    },
  },
);

export interface ISelectProps extends SelectHTMLAttributes<HTMLSelectElement>,
  VariantProps<typeof selectVariants> {
  label: string
  errorMessage?: string
  placeholder?: string
  options: Array<{
    value: any
    label: string
  }>
};

const Select = React.forwardRef<HTMLSelectElement, ISelectProps>(
  ({
     label,
     options = [],
     id,
     variant,
     errorMessage,
     placeholder,
     ...rest
   }, ref) => (
    <div className="mb-5 lg:mb-6">
      <label
        htmlFor={id}
        className="mb-3 block text-neutral-black text-base font-semibold text-bodySmall"
      >
        {label}
      </label>
      <div className="relative">
        <select
          ref={ref}
          {...rest}
          defaultValue=""
          className={cn(selectVariants({ variant }))}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.8">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                fill="#637381"
              />
            </g>
          </svg>
        </span>
      </div>
      {!!errorMessage && (
        <span className="mt-3 block text-danger text-based lg:text-xl">{errorMessage}</span>
      )}
    </div>
  ),
);

Select.displayName = 'select';

export default Select;
