import { type PreviewMeeting, type PreviewTone } from '../model/data'

type CalendarPanelProps = {
  meetings: PreviewMeeting[]
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

function splitSlot(slot: string): { date: string, time: string } {
  const [datePart, ...timeParts] = slot.split(',')
  const date = datePart.trim() || 'Без даты'
  const time = timeParts.join(',').trim()
  return { date, time }
}

function groupedMeetings(meetings: PreviewMeeting[]): Array<{ date: string, meetings: PreviewMeeting[] }> {
  const map = new Map<string, PreviewMeeting[]>()

  for (const meeting of meetings) {
    const { date } = splitSlot(meeting.slot)
    const current = map.get(date)
    if (current) {
      current.push(meeting)
      continue
    }
    map.set(date, [meeting])
  }

  return Array.from(map, ([date, grouped]) => ({ date, meetings: grouped }))
}

export function CalendarPanel({ meetings }: CalendarPanelProps) {
  const rows = groupedMeetings(meetings)

  // @dvnull: Ранее календарь рендерился списком карточек; по задаче переведен в отдельную табличную вкладку.
  return (
    <section className="preview11-card">
      <div className="preview11-panel-head">
        <h3 className="preview11-panel-title">Календарь встреч</h3>
        <p className="preview11-panel-subtitle">
          Встречи отображаются таблицей в стиле корпоративных мессенджеров.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="preview11-empty-state">
          <p>В расписании пока нет встреч.</p>
        </div>
      ) : (
        <div className="preview11-table-wrap">
          <table className="preview11-table preview11-meetings-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th className="preview11-meet-cell">Встречи</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td className="preview11-meet-cell">
                    {row.meetings.map((meeting) => {
                      const { time } = splitSlot(meeting.slot)

                      return (
                        <article key={meeting.id} className="preview11-meeting-card">
                          <div className="preview11-feed-item-top">
                            <p className="preview11-feed-item-title">{meeting.title}</p>
                            <span className={`preview11-tag ${toneClassName(meeting.statusTone)}`}>
                              {meeting.statusLabel}
                            </span>
                          </div>
                          <p className="preview11-meeting-time">
                            {time ? `${time} • ${meeting.owner}` : meeting.owner}
                          </p>
                          <p className="preview11-feed-item-text">{meeting.linkLabel}</p>
                        </article>
                      )
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
