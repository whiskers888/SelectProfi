import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ProfileAdminSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Профиль администратора</CardTitle>
      </CardHeader>
      <CardContent>
        {/* @dvnull: Inline-блок роли Admin вынесен из ProfilePage для дальнейшего уменьшения контекста страницы без изменения UX. */}
        <p className="text-sm text-muted-foreground">Для этой роли нет дополнительных полей профиля.</p>
      </CardContent>
    </Card>
  )
}
