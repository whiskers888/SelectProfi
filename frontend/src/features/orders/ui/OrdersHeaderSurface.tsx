import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CardHeader, CardTitle } from '@/components/ui/card'

export type OrdersHeaderSurfaceProps = {
  onRefresh: () => void | Promise<void>
  previewPath: string
}

export function OrdersHeaderSurface({ onRefresh, previewPath }: OrdersHeaderSurfaceProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between gap-4">
      <CardTitle className="text-xl">Заказы</CardTitle>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => void onRefresh()}>
          Обновить
        </Button>
        <Button asChild type="button" variant="ghost">
          <Link to={previewPath}>В preview</Link>
        </Button>
      </div>
    </CardHeader>
  )
}
