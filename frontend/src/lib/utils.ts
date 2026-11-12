import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-label-micro',
        'text-caption-meta',
        'text-caption-meta-medium',
        'text-body-default',
        'text-body-medium',
        'text-body-semibold',
        'text-headline-section',
        'text-display-page-title',
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
