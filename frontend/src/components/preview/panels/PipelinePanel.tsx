import { Button } from '@/components/ui/button'
import { type PreviewPipelineStage, type PreviewTone } from '../model/data'

type PipelinePanelProps = {
  errorMessage?: string | null
  onRetry?: () => void
  pipeline: PreviewPipelineStage[]
}

function toneClassName(tone: PreviewTone): string {
  if (tone === 'success') {
    return 'preview11-tag-ok'
  }

  if (tone === 'warning') {
    return 'preview11-tag-warn'
  }

  if (tone === 'danger') {
    return 'preview11-tag-danger'
  }

  return 'preview11-tag-neutral'
}

function progressColorClass(tone: PreviewTone): string {
  if (tone === 'success') {
    return 'preview11-progress-success'
  }

  if (tone === 'warning') {
    return 'preview11-progress-warning'
  }

  if (tone === 'danger') {
    return 'preview11-progress-danger'
  }

  if (tone === 'neutral') {
    return 'preview11-progress-neutral'
  }

  return 'preview11-progress-default'
}

function progressWidth(value: number, maxValue: number): string {
  if (maxValue <= 0) {
    return '20%'
  }

  const ratio = value / maxValue
  const clamped = Math.max(0.2, Math.min(1, ratio))
  return `${Math.round(clamped * 100)}%`
}

export function PipelinePanel({
  errorMessage,
  onRetry,
  pipeline,
}: PipelinePanelProps) {
  if (errorMessage) {
    return (
      <section className="preview11-error-card">
        <h3>Ошибка аналитики</h3>
        <p>{errorMessage}</p>
        {onRetry ? (
          <Button
            className="preview11-mini-btn"
            onClick={onRetry}
            type="button"
            variant="outline"
          >
            Повторить загрузку
          </Button>
        ) : null}
      </section>
    )
  }

  const maxCount = Math.max(...pipeline.map((stage) => stage.count), 1)

  // @dvnull: Pipeline был на generic Card/Badge, переведен на HTML-линейки с цветовой семантикой этапов.
  return (
    <section className="preview11-card">
      <div className="preview11-panel-head">
        <h3 className="preview11-panel-title">Pipeline вакансий</h3>
        <p className="preview11-panel-subtitle">Движение кандидатов по этапам с текущей динамикой.</p>
      </div>

      <div className="preview11-pipeline">
        {pipeline.map((stage) => (
          <article key={stage.id} className="preview11-pipeline-item">
            <div className="preview11-feed-item-top">
              <p className="preview11-feed-item-title">{stage.label}</p>
              <div className="preview11-pipeline-meta">
                <span className={`preview11-tag ${toneClassName(stage.tone)}`}>{stage.count}</span>
                <span className="preview11-pipeline-delta">{stage.delta}</span>
              </div>
            </div>
            <div className="preview11-progress-track">
              <span
                className={`preview11-progress-line ${progressColorClass(stage.tone)}`}
                style={{ width: progressWidth(stage.count, maxCount) }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
