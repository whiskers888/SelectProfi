import { type ReactNode } from 'react'
import { type WorkspaceStat } from '../model/data'

type StatsGridProps = {
  stats: WorkspaceStat[]
  onOverview: (statId: string) => void
}

function resolveStatBadge(stat: WorkspaceStat): null | { tagClassName: 'preview11-tag-ok' | 'preview11-tag-warn' } {
  if (stat.id === 'projects' || stat.id === 'shortlist') {
    return { tagClassName: 'preview11-tag-ok' }
  }

  if (stat.id === 'pipeline') {
    return { tagClassName: 'preview11-tag-warn' }
  }

  if (stat.label === 'Проекты в работе' || stat.label === 'Финалисты' || stat.label === 'Заказы в работе') {
    return { tagClassName: 'preview11-tag-ok' }
  }

  if (stat.label === 'Кандидаты на рассмотрении') {
    return { tagClassName: 'preview11-tag-warn' }
  }

  return null
}

function shouldHighlightProjectsCard(stat: WorkspaceStat): boolean {
  return stat.id === 'projects' || stat.label === 'Проекты в работе' || stat.label === 'Заказы в работе'
}

function renderStatValue(value: string): string | ReactNode {
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

export function StatsGrid({ stats, onOverview }: StatsGridProps) {
  return (
    <section className="preview11-stats">
      {stats.map((stat) => {
        const badge = resolveStatBadge(stat)
        const cardClassName = `preview11-card preview-slide-up${
          shouldHighlightProjectsCard(stat) ? ' preview11-card-projects' : ''
        }`

        return (
          <article key={stat.id} className={cardClassName}>
            <div className="preview11-card-top">
              {badge ? (
                <span className={`preview11-tag ${badge.tagClassName}`}>{stat.label}</span>
              ) : (
                <p className="preview11-card-meta">{stat.label}</p>
              )}
              {stat.id !== 'projects' && stat.id !== 'balance' ? (
                <button className="preview11-mini-btn" onClick={() => onOverview(stat.id)} type="button">
                  Обзор
                </button>
              ) : null}
            </div>
            <p className="preview11-card-value">{renderStatValue(stat.value)}</p>
            <p className="preview11-card-meta">{stat.note}</p>
          </article>
        )
      })}
    </section>
  )
}
