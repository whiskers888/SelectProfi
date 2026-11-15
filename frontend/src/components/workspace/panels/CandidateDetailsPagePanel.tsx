import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { workspaceToneToBadgeVariant, type WorkspaceCandidate } from '../model/data'
import { formatExperienceYears } from '../shell/workspaceShell.helpers'

interface CandidateDetailsPagePanelProps {
  candidate: WorkspaceCandidate
  onBack: () => void
}

export function CandidateDetailsPagePanel({ candidate, onBack }: Readonly<CandidateDetailsPagePanelProps>) {
  return (
    <Card className="rounded-xl border-border p-4 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Информация о кандидате</h3>
          <p className="mt-1 text-sm text-muted-foreground">Комментарии к кандидату недоступны.</p>
        </div>
        <Button
          className="h-10 rounded-xl border-border text-muted-foreground"
          onClick={onBack}
          type="button"
          variant="outline"
        >
          Назад
        </Button>
      </div>

      <Alert>
        <p className="text-sm text-muted-foreground">
          Покупка профиля и доступ к комментариям не поддерживаются.
        </p>
      </Alert>

      <dl className="mt-4 grid gap-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">Кандидат</dt>
          <dd className="mt-1 text-sm text-foreground">{candidate.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">Позиция</dt>
          <dd className="mt-1 text-sm text-foreground">{candidate.position}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">Опыт работы</dt>
          <dd className="mt-1 text-sm text-foreground">{formatExperienceYears(candidate.experienceYears)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">Источник</dt>
          <dd className="mt-1 text-sm text-foreground">{candidate.source}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">Рейтинг</dt>
          <dd className="mt-1 text-sm text-foreground">{candidate.rating}</dd>
        </div>
        {candidate.statusLabel.trim() ? (
          <div className="pt-1">
            <Badge variant={workspaceToneToBadgeVariant(candidate.statusTone)}>{candidate.statusLabel}</Badge>
          </div>
        ) : null}
      </dl>
    </Card>
  )
}
