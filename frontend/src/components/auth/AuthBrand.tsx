import { cn } from '@/lib/utils'

type AuthBrandProps = {
  inverted?: boolean
}

export function AuthBrand({ inverted = false }: AuthBrandProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 text-sm font-semibold tracking-tight',
        inverted ? 'text-primary-foreground dark:text-secondary-foreground' : 'text-primary',
      )}
    >
      <span
        className={cn(
          'grid h-9 w-9 place-items-center rounded-xl text-xs font-bold',
          inverted ? 'bg-card/20 text-primary-foreground dark:text-secondary-foreground' : 'bg-primary text-primary-foreground',
        )}
      >
        SP
      </span>
      <span className="text-base">SelectProfi</span>
    </div>
  )
}
