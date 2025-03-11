import { type ClassValue, clsx } from 'clsx';
import {extendTailwindMerge, twMerge} from 'tailwind-merge';
import { DateTime } from 'luxon';

const customTwMerge = extendTailwindMerge({
  classGroups: {
    'font-size': ['text-h1', 'text-h2', 'text-h3', 'text-h4', 'text-h5', 'text-h6', 'text-body', 'text-body', 'text-caption', 'text-bodySmall'],
  },
})

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}

export const maxWidth = 1440;

export const currentDate = (format?: string) => {
  const dt = DateTime.now().toFormat(format || 'dd/MM/yyyy');

  return dt;
};
