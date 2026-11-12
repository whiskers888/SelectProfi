import { cn } from '@/lib/utils'

type BrandLogoProps = {
  className?: string
  alt?: string
}

export function BrandLogo({ className, alt = 'КадрыТут' }: BrandLogoProps) {
  return (
    <img
      src="/logo.webp"
      alt={alt}
      width={40}
      height={40}
      className={cn('shrink-0 object-contain', className)}
    />
  )
}
