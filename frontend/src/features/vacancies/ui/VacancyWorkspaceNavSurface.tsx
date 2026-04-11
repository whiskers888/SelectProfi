import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type VacancyWorkspaceNavSection = 'details' | 'pipeline' | 'candidates' | 'candidate-create'

export type VacancyWorkspaceNavSurfaceProps = {
  activeSection: VacancyWorkspaceNavSection
  onSectionChange: (section: VacancyWorkspaceNavSection) => void
}

export function VacancyWorkspaceNavSurface({ activeSection, onSectionChange }: VacancyWorkspaceNavSurfaceProps) {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Навигация по вакансии</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={activeSection === 'details' ? 'default' : 'outline'}
          onClick={() => onSectionChange('details')}
        >
          Детали
        </Button>
        <Button
          type="button"
          variant={activeSection === 'pipeline' ? 'default' : 'outline'}
          onClick={() => onSectionChange('pipeline')}
        >
          Pipeline
        </Button>
        <Button
          type="button"
          variant={activeSection === 'candidate-create' ? 'default' : 'outline'}
          onClick={() => onSectionChange('candidate-create')}
        >
          Добавление кандидата
        </Button>
        <Button
          type="button"
          variant={activeSection === 'candidates' ? 'default' : 'outline'}
          onClick={() => onSectionChange('candidates')}
        >
          Кандидаты
        </Button>
      </CardContent>
    </Card>
  )
}
