'use client';
import React, {ChangeEventHandler, InputHTMLAttributes, ReactNode} from "react";
import {cva, VariantProps} from "class-variance-authority";
import {cn} from "@/lib/utils";

const inputVariants = cva(
  'w-full caret-primary h-full rounded-lg placeholder:text-text-secondary text-base lg:text-bodySmall text-neutral-black bg-surface py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter',
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
export interface ITextInputProps
  extends InputHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  parser?: (
    e: string,
    callback: React.ChangeEventHandler<HTMLTextAreaElement> | undefined,
  ) => void
  onChange?: ChangeEventHandler<HTMLTextAreaElement> | undefined
  errorMessage?: string
  rightIcon?: ReactNode
  rightIconClick?: () => void
  containerClassname?: string
}
const TextArea = React.forwardRef<HTMLTextAreaElement, ITextInputProps>(
  (
    {
      label,
      id,
      placeholder,
      parser,
      value,
      onChange,
      type = 'text',
      errorMessage,
      variant,
      rightIcon,
      rightIconClick,
      className,
      disabled,
      containerClassname,
      ...rest
    }: ITextInputProps,
    ref,
  ) => (
    <div style={{ opacity: disabled ? 0.5 : 1 }} className={containerClassname ? `${containerClassname} mb-4 lg:mb-4 flex flex-col` : 'flex flex-col mb-4 lg:mb-4'}>
      <label
        htmlFor={id}
        className="mb-3 block text-neutral-black text-base font-semibold text-bodySmall"
      >
        {label}
      </label>
      <div className="relative flex-1">
        <textarea
          ref={ref}
          id={id}
          value={value}
          onChange={(e) => {
            if (parser) {
              parser(e.target.value, onChange);
              return;
            }
            if (onChange) {
              onChange(e);
            }
          }}
          placeholder={placeholder}
          {...rest}
          className={cn(inputVariants({ variant, icons: rightIcon ? 'right' : 'none', className }))}
        />
        {!!rightIcon && (
          <button type="button" onClick={rightIconClick} className="absolute right-0 top-0 h-full px-4 lg:px-8 items-center flex hover:cursor-pointer">
            {rightIcon}
          </button>
        )}
      </div>
      {!!errorMessage && (
        <span className="mt-3 block text-danger text-based lg:text-xl">{errorMessage}</span>
      )}
    </div>
  ),
);

TextArea.displayName = 'textArea';
export default TextArea;
