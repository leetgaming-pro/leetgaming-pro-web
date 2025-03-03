import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cl(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
