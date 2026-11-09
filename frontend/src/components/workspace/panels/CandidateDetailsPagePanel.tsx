import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { workspaceToneToBadgeVariant, type WorkspaceCandidate } from '../model/data'

type CandidateDetailsPagePanelProps = {
  candidate: WorkspaceCandidate
  canPurchase: boolean
  isPurchased: boolean
  onBack: () => void
  onPurchase: () => void
}

export function CandidateDetailsPagePanel({
  candidate,
  canPurchase,
  isPurchased,
  onBack,
  onPurchase,
}: CandidateDetailsPagePanelProps) {
  const isCommentsLocked = canPurchase && !isPurchased
  const purchaseButtonLabel = canPurchase ? (isPurchased ? 'Куплено' : 'Купить') : 'Уже доступно'
  const isPurchaseButtonDisabled = !canPurchase || isPurchased

  return (
    <Card className="rounded-xl border-border p-4 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Резюме кандидата</h3>
          {isCommentsLocked ? (
            <p className="mt-1 text-sm text-muted-foreground">Комментарии рекрутера скрыты до покупки.</p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">{candidate.comment}</p>
          )}
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {canPurchase
              ? candidate.sourceType === 'AddedByExecutor'
                ? 'Резюме обезличено. Для доступа к полному профилю и комментариям требуется покупка.'
                : 'Для доступа к комментариям других рекрутеров требуется покупка.'
              : 'Профиль уже доступен без покупки.'}
          </span>
          <Button
            className={
              isPurchaseButtonDisabled
                ? 'h-10 rounded-xl border-border text-muted-foreground'
                : 'h-10 rounded-xl bg-success text-primary-foreground hover:bg-success/90'
            }
            disabled={isPurchaseButtonDisabled}
            onClick={onPurchase}
            type="button"
            variant={isPurchaseButtonDisabled ? 'outline' : 'default'}
          >
            {purchaseButtonLabel}
          </Button>
        </div>
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
