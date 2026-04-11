import { Dropdown } from '@/components/ui/dropdown'
import { type WorkspaceView } from '../model/data'

type HeaderMenuAction = 'profile' | 'settings' | 'orders' | 'vacancies' | 'logout'

type HeaderProps = {
  activeView: WorkspaceView
  createLabel: string
  meetingsCount: number
  notificationsCount: number
  onCreateAction: () => void
  onOpenMeetings: () => void
  onOpenNotifications: () => void
  onMenuAction: (action: HeaderMenuAction) => void
  onSearchChange: (value: string) => void
  profileDisplayName: string
  profileEmail: string
  profileRoleLabel: string
  searchValue: string
  title: string
  subtitle: string
}

function profileInitials(displayName: string): string {
  const parts = displayName
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)

  if (parts.length === 0) {
    return 'SP'
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
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
  profileDisplayName,
  profileEmail,
  profileRoleLabel,
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
            { id: 'orders', label: 'Заказы (API)' },
            { id: 'vacancies', label: 'Вакансии (API)' },
            { id: 'logout', label: 'Выйти из аккаунта', tone: 'destructive' },
          ]}
          onSelect={(itemId) => {
            if (
              itemId === 'profile' ||
              itemId === 'settings' ||
              itemId === 'orders' ||
              itemId === 'vacancies' ||
              itemId === 'logout'
            ) {
              onMenuAction(itemId)
            }
          }}
          trigger={
            <span className="preview11-profile-chip">
              <span>
                {/* @dvnull: Ранее имя/роль в хедере были статическими от demo-role, переведено на данные профиля backend. */}
                <span className="preview11-profile-name">{profileDisplayName}</span>
                <span className="preview11-muted">{profileRoleLabel}</span>
                <span className="preview11-muted">{profileEmail}</span>
              </span>
              <span className="preview11-avatar">{profileInitials(profileDisplayName)}</span>
            </span>
          }
        />
      </div>
    </header>
  )
}
