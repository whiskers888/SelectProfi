import { cn } from '@/lib/utils'

type AuthBrandProps = {
  inverted?: boolean
}

export function AuthBrand({ inverted = false }: AuthBrandProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 text-sm font-semibold tracking-tight',
        inverted ? 'text-white' : 'text-blue-700',
      )}
    >
      <span
        className={cn(
          'grid h-9 w-9 place-items-center rounded-xl text-xs font-bold',
          inverted ? 'bg-white/20 text-white' : 'bg-blue-600 text-white',
        )}
      >
        SP
      </span>
      <span className="text-base">SelectProfi</span>
    </div>
  )
}
