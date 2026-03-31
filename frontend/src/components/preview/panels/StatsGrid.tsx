import { type PreviewStat, type PreviewTone } from '../model/data'

type StatsGridProps = {
  stats: PreviewStat[]
}

function toneClassName(tone: PreviewTone | undefined): string {
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

function toneLabel(tone: PreviewTone | undefined): string {
  if (tone === 'success') {
    return 'Стабильно'
  }

  if (tone === 'warning') {
    return 'Внимание'
  }

  if (tone === 'danger') {
    return 'Риск'
  }

  return 'Обзор'
}

export function StatsGrid({ stats }: StatsGridProps) {
  // @dvnull: Была card-сетка UI-kit, заменил на HTML-card структуру stats.
  return (
    <section className="preview11-stats">
      {stats.map((stat) => (
        <article key={stat.id} className="preview11-card preview-slide-up">
          <div className="preview11-card-top">
            <p className="preview11-card-meta">{stat.label}</p>
            <span className={`preview11-tag ${toneClassName(stat.tone)}`}>{toneLabel(stat.tone)}</span>
          </div>
          <p className="preview11-card-value">{stat.value}</p>
          <p className="preview11-card-meta">{stat.note}</p>
        </article>
      ))}
    </section>
  )
}
