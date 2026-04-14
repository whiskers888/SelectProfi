import { type WorkspaceStat, type WorkspaceTone } from '../model/data'

type StatsGridProps = {
  stats: WorkspaceStat[]
}

function toneClassName(tone: WorkspaceTone | undefined): string {
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

function toneLabel(tone: WorkspaceTone | undefined, statId: string): string {
  if (statId === 'shortlist' && tone === 'warning') {
    return 'Проверить'
  }

  if (tone === 'success') {
    return 'Стабильно'
  }

  if (tone === 'warning') {
    return 'В работе'
  }

  if (tone === 'danger') {
    return 'Риск'
  }

  return 'Старт'
}

function renderStatValue(value: string): string | JSX.Element {
  const suffix = ' чел.'
  if (!value.endsWith(suffix)) {
    return value
  }

  return (
    <>
      {value.slice(0, -suffix.length)}
      <span className="preview11-card-value-suffix">{suffix.trim()}</span>
    </>
  )
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section className="preview11-stats">
      {stats.map((stat) => (
        <article key={stat.id} className="preview11-card preview-slide-up">
          <div className="preview11-card-top">
            <p className="preview11-card-meta">{stat.label}</p>
            {stat.id !== 'projects' ? (
              <span className={`preview11-tag ${toneClassName(stat.tone)}`}>{toneLabel(stat.tone, stat.id)}</span>
            ) : null}
          </div>
          <p className="preview11-card-value">{renderStatValue(stat.value)}</p>
          <p className="preview11-card-meta">{stat.note}</p>
        </article>
      ))}
    </section>
  )
}
