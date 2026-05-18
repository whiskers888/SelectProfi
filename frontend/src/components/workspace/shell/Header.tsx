import { ArrowRightLeft, Bell, CalendarDays } from 'lucide-react'
import { Dropdown } from '@/components/ui/dropdown'
import { type WorkspaceRole, type WorkspaceView } from '../model/data'

type HeaderMenuAction = 'profile' | 'settings' | 'logout'

type HeaderProps = {
  activeView: WorkspaceView
  canSwitchRole: boolean
  createLabel: string
  isSwitchingRole: boolean
  meetingsCount: number
  notificationsCount: number
  onCreateAction: () => void
  onOpenMeetings: () => void
  onOpenNotifications: () => void
  onMenuAction: (action: HeaderMenuAction) => void
  onSearchChange: (value: string) => void
  onSwitchRole: () => void
  profileDisplayName: string
  profileEmail: string
  profileRoleLabel: string
  role: WorkspaceRole
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
  canSwitchRole,
  createLabel,
  isSwitchingRole,
  meetingsCount,
  notificationsCount,
  onCreateAction,
  onOpenMeetings,
  onOpenNotifications,
  onMenuAction,
  onSearchChange,
  onSwitchRole,
  profileDisplayName,
  profileEmail,
  profileRoleLabel,
  role,
  searchValue,
  subtitle,
  title,
}: HeaderProps) {
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
            placeholder={role === 'Executor' ? 'Поиск...' : 'Поиск...'}
            type="search"
            value={searchValue}
          />
        </div>

        <div className="preview11-context-tabs">
          <button
            className={`preview11-context-tab${activeView === 'meetings' ? ' preview11-context-tab-active' : ''}`}
            onClick={onOpenMeetings}
            type="button"
          >
            <span className="preview11-context-icon" aria-hidden="true">
              <CalendarDays size={15} strokeWidth={2} />
            </span>{' '}
            <span className="preview11-badge">{meetingsCount}</span>
          </button>
          <button
            className={`preview11-context-tab${activeView === 'chats' ? ' preview11-context-tab-active' : ''}`}
            onClick={onOpenNotifications}
            type="button"
          >
            <span className="preview11-context-icon" aria-hidden="true">
              <Bell size={15} strokeWidth={2} />
            </span>{' '}
            <span className="preview11-badge">{notificationsCount}</span>
          </button>
        </div>

        <span className="preview11-profile-stack">
          {/* Триггер дропдауна — только информация о профиле, без кнопки переключения роли */}
          <Dropdown
            className="preview11-profile-dropdown"
            contentClassName="preview11-profile-menu"
            items={[
              { id: 'profile', label: 'Мой профиль' },
              { id: 'settings', label: 'Настройки' },
              { id: 'logout', label: 'Выйти из аккаунта', tone: 'destructive' },
            ]}
            onSelect={(itemId) => {
              if (itemId === 'profile' || itemId === 'settings' || itemId === 'logout') {
                onMenuAction(itemId)
              }
            }}
            trigger={
              <span className="preview11-profile-chip">
                <span className="preview11-profile-meta">
                  <span className="preview11-profile-name">{profileDisplayName}</span>
                  <span className="preview11-profile-role-row">
                    <span className="preview11-profile-role-spacer" aria-hidden="true" />
                    <span className="preview11-profile-role-text">{profileRoleLabel}</span>
                    <span className="preview11-profile-role-spacer" aria-hidden="true" />
                  </span>
                  <span className="preview11-profile-email">{profileEmail}</span>
                </span>
                <span className="preview11-avatar">{profileInitials(profileDisplayName)}</span>
              </span>
            }
          />
          {/* Кнопка переключения роли вынесена отдельно, чтобы избежать вложенности <button> в <button> */}
          {canSwitchRole && (
            <button
              className="preview11-profile-role-pill"
              disabled={isSwitchingRole}
              onClick={onSwitchRole}
              type="button"
              aria-label="Переключить активную роль"
            >
              <span className="preview11-profile-role-label">{profileRoleLabel}</span>
              <span className="preview11-profile-role-arrows" aria-hidden="true">
                <span className="preview11-profile-role-arrow">
                  <ArrowRightLeft size={18} strokeWidth={2.3} />
                </span>
              </span>
            </button>
          )}
        </span>
      </div>
    </header>
  )
}