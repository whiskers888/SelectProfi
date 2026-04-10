import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { VacancyResponse, VacancyStatusContract } from '@/shared/api/vacancies'

export type VacanciesListSurfaceProps = {
  vacancies: VacancyResponse[]
  currentVacancyId: string
  currentVacanciesOffset: number
  requesterRole: string | undefined
  isUpdatingVacancyStatus: boolean
  onSelectVacancy: (vacancyId: string) => void
  onStatusTransition: (vacancy: VacancyResponse) => void | Promise<void>
}

function getLifecycleAction(
  role: string | undefined,
  vacancy: VacancyResponse,
): { label: string; status: VacancyStatusContract } | null {
  if (role === 'Executor' && vacancy.status === 'Draft') {
    return { label: 'На согласование', status: 'OnApproval' }
  }

  if (role === 'Executor' && vacancy.status === 'OnApproval') {
    return { label: 'Вернуть в Draft', status: 'Draft' }
  }

  if (role === 'Customer' && vacancy.status === 'OnApproval') {
    return { label: 'Опубликовать', status: 'Published' }
  }

  return null
}

export function VacanciesListSurface({
  vacancies,
  currentVacancyId,
  currentVacanciesOffset,
  requesterRole,
  isUpdatingVacancyStatus,
  onSelectVacancy,
  onStatusTransition,
}: VacanciesListSurfaceProps) {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Список вакансий</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {vacancies.length === 0 ? (
          <Alert>
            {currentVacanciesOffset > 0
              ? 'На выбранной странице вакансий нет. Измените offset или вернитесь назад.'
              : 'Пока нет вакансий.'}
          </Alert>
        ) : null}
        {vacancies.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>OrderId</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-[140px]">Контекст</TableHead>
                <TableHead className="w-[220px]">Lifecycle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vacancies.map((vacancy) => {
                const action = getLifecycleAction(requesterRole, vacancy)
                return (
                  <TableRow key={vacancy.id} className={vacancy.id === currentVacancyId ? 'bg-slate-50' : undefined}>
                    <TableCell>{vacancy.title}</TableCell>
                    <TableCell>{vacancy.orderId}</TableCell>
                    <TableCell>{vacancy.status}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant={vacancy.id === currentVacancyId ? 'default' : 'outline'}
                        onClick={() => onSelectVacancy(vacancy.id)}
                      >
                        Использовать
                      </Button>
                    </TableCell>
                    <TableCell>
                      {action ? (
                        <Button
                          type="button"
                          onClick={() => void onStatusTransition(vacancy)}
                          disabled={isUpdatingVacancyStatus}
                        >
                          {action.label}
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">Нет доступного перехода</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
    </Card>
  )
}
