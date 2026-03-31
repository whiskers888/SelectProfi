import { type PreviewActivity, type PreviewTone } from '../model/data'

type ActivityPanelProps = {
  activity: PreviewActivity[]
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

export function ActivityPanel({ activity }: ActivityPanelProps) {
  // @dvnull: Лента активности была оформлена как generic Card-list, заменена на HTML list/item.
  return (
    <section className="preview11-card">
      <div className="preview11-panel-head">
        <h3 className="preview11-panel-title">Лента активности</h3>
        <p className="preview11-panel-subtitle">
          Изменения заказов, откликов и коммуникаций команды.
        </p>
      </div>

      {activity.length === 0 ? (
        <div className="preview11-empty-state">
          <p>Событий пока нет.</p>
        </div>
      ) : (
        <ul className="preview11-list">
          {activity.map((item) => (
            <li key={item.id} className="preview11-list-item">
              <div className="preview11-feed-item-top">
                <p className="preview11-feed-item-title">{item.title}</p>
                <span className={`preview11-tag ${toneClassName(item.tone)}`}>{item.time}</span>
              </div>
              <p className="preview11-feed-item-text">{item.description}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
