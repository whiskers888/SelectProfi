import { Dropdown } from '@/components/ui/dropdown'
import { type PreviewRole, type PreviewView } from '../model/data'

type HeaderMenuAction = 'profile' | 'settings' | 'logout'

type HeaderProps = {
  activeView: PreviewView
  createLabel: string
  meetingsCount: number
  notificationsCount: number
  onCreateAction: () => void
  onOpenMeetings: () => void
  onOpenNotifications: () => void
  onMenuAction: (action: HeaderMenuAction) => void
  onSearchChange: (value: string) => void
  role: PreviewRole
  searchValue: string
  title: string
  subtitle: string
}

function profileLabel(role: PreviewRole): string {
  if (role === 'Executor') {
    return 'Исполнитель'
  }

  if (role === 'Applicant') {
    return 'Соискатель'
  }

  return 'Заказчик'
}

function profileName(role: PreviewRole): string {
  if (role === 'Executor') {
    return 'Мария К.'
  }

  if (role === 'Applicant') {
    return 'Андрей Н.'
  }

  return 'Иван П.'
}

function profileInitials(role: PreviewRole): string {
  if (role === 'Executor') {
    return 'ИС'
  }

  if (role === 'Applicant') {
    return 'СИ'
  }

  return 'ЗК'
}

export function Header({
  activeView,
  createLabel,
  meetingsCount,
  notificationsCount,
  onCreateAction,
  onOpenMeetings,
  onOpenNotifications,
  onMenuAction,
  onSearchChange,
  role,
  searchValue,
  subtitle,
  title,
}: HeaderProps) {
  // @dvnull: Ранее был blue-tailwind header, перевел shell на структуру и визуальные паттерны HTML-эталона.
  return (
    <header className="preview11-header">
      <div className="preview11-header-title">
        <h1 className="preview11-title">{title}</h1>
        <p className="preview11-subtitle">{subtitle}</p>
      </div>

      <div className="preview11-header-right">
        <div className="preview11-header-actions">
          <button className="preview11-btn preview11-btn-primary" onClick={onCreateAction} type="button">
            {createLabel}
          </button>
          <input
            aria-label="Поиск"
            className="preview11-input preview11-header-search"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Поиск по заказам и исполнителям..."
            type="search"
            value={searchValue}
          />
        </div>

        <div className="preview11-context-tabs">
          {/* @dvnull: Ранее табы встреч/уведомлений были неинтерактивными span, вернул рабочие кнопки навигации. */}
          <button
            className={`preview11-context-tab${activeView === 'meetings' ? ' preview11-context-tab-active' : ''}`}
            onClick={onOpenMeetings}
            type="button"
          >
            📅 <span className="preview11-badge">{meetingsCount}</span>
          </button>
          <button
            className={`preview11-context-tab${activeView === 'chats' ? ' preview11-context-tab-active' : ''}`}
            onClick={onOpenNotifications}
            type="button"
          >
            🔔 <span className="preview11-badge">{notificationsCount}</span>
          </button>
        </div>

        <Dropdown
          contentClassName="preview11-profile-menu"
          items={[
            { id: 'profile', label: 'Мой профиль' },
            { id: 'settings', label: 'Настройки' },
            { id: 'logout', label: 'Выйти из аккаунта', tone: 'destructive' },
          ]}
          onSelect={(itemId) => {
            if (
              itemId === 'profile' ||
              itemId === 'settings' ||
              itemId === 'logout'
            ) {
              onMenuAction(itemId)
            }
          }}
          trigger={
            <span className="preview11-profile-chip">
              <span>
                <span className="preview11-profile-name">{profileName(role)}</span>
                <span className="preview11-muted">{profileLabel(role)}</span>
              </span>
              <span className="preview11-avatar">{profileInitials(role)}</span>
            </span>
          }
        />
      </div>
    </header>
  )
}
