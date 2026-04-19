import { type ReactNode } from 'react'
import { type WorkspaceStat } from '../model/data'

type StatsGridProps = {
  stats: WorkspaceStat[]
  onOverview: (statId: string) => void
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
      {stats.map((stat) => (
        <article key={stat.id} className="preview11-card preview-slide-up">
          <div className="preview11-card-top">
            <p className="preview11-card-meta">{stat.label}</p>
            {stat.id !== 'projects' ? (
              <button className="preview11-mini-btn" onClick={() => onOverview(stat.id)} type="button">
                Обзор
              </button>
            ) : null}
          </div>
          <p className="preview11-card-value">{renderStatValue(stat.value)}</p>
          <p className="preview11-card-meta">{stat.note}</p>
        </article>
      ))}
    </section>
  )
}
