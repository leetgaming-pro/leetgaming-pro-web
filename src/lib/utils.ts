import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DateTime } from 'luxon';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const maxWidth = 1440;

export const currentDate = (format?: string) => {
  const dt = DateTime.now().toFormat(format || 'dd/MM/yyyy');

  return dt;
};
