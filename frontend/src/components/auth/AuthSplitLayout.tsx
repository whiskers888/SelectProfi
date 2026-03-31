import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type AuthSplitLayoutProps = {
  children: ReactNode
  hero: ReactNode
  reverseOnDesktop?: boolean
}

export function AuthSplitLayout({
  children,
  hero,
  reverseOnDesktop = false,
}: AuthSplitLayoutProps) {
  return (
    <section className="auth-page-bg min-h-screen px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[1180px] items-center justify-center sm:min-h-[calc(100vh-4rem)]">
        <Card className="w-full overflow-hidden border-slate-200 bg-white shadow-[0_24px_48px_rgba(15,23,42,0.14)]">
          <div className="grid min-h-[760px] grid-cols-1 md:grid-cols-2">
            <div
              className={cn(
                'auth-panel-enter flex flex-col justify-center p-6 md:p-11',
                reverseOnDesktop ? 'md:order-1' : 'md:order-2',
              )}
            >
              {children}
            </div>
            <div className={cn(reverseOnDesktop ? 'md:order-2' : 'md:order-1')}>{hero}</div>
          </div>
        </Card>
      </div>
    </section>
  )
}
