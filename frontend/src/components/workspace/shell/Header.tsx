import { useState } from 'react'
import { ArrowRightLeft, Bell, CalendarDays, Menu, Moon, Sun } from 'lucide-react'
import { applyTheme, getNextTheme, readTheme } from '@/app/theme'
import { Dropdown } from '@/components/ui/dropdown'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { type WorkspaceView } from '../model/data'

type HeaderMenuAction = 'profile' | 'settings' | 'logout'

interface HeaderProps {
  activeView: WorkspaceView
  isExecutor?: boolean
  canSwitchRole: boolean
  isSwitchingRole: boolean
  meetingsCount: number
  notificationsCount: number
  onOpenMeetings: () => void
  onOpenNotifications: () => void
  onMenuAction: (action: HeaderMenuAction) => void
  onSearchChange: (value: string) => void
  onSwitchRole: () => void
  onToggleMobileNav: () => void
  profileDisplayName: string
  profileEmail: string
  profileRoleLabel: string
  searchValue: string
}

function profileInitials(displayName: string): string {
  const parts = displayName
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)

  if (parts.length === 0) {
    return 'КТ'
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function Header({
  activeView,
  isExecutor = false,
  canSwitchRole,
  isSwitchingRole,
  meetingsCount,
  notificationsCount,
  onOpenMeetings,
  onOpenNotifications,
  onMenuAction,
  onSearchChange,
  onSwitchRole,
  onToggleMobileNav,
  profileDisplayName,
  profileEmail,
  profileRoleLabel,
  searchValue,
}: HeaderProps) {
  const [theme, setTheme] = useState(readTheme)

  function toggleTheme() {
    const nextTheme = getNextTheme(theme)
    applyTheme(nextTheme)
    setTheme(nextTheme)
  }

  return (
    <header className="preview11-header">
      <div className="preview11-header-title preview11-header-brand flex items-center gap-2">
        <button
          aria-label="Открыть навигацию"
          className="preview11-mobile-nav-toggle"
          onClick={onToggleMobileNav}
          type="button"
        >
          <Menu size={20} strokeWidth={2} aria-hidden="true" />
        </button>
        <BrandLogo className="h-7 w-7 shrink-0" alt="" />
        <div className="preview11-brand-copy">
          <div className="preview11-brand-title">КадрыТут</div>
          <div className="preview11-muted">Маркетплейс подбора персонала</div>
        </div>
      </div>

      <div className="preview11-header-right">
        <div className="preview11-header-actions">
          <input
            aria-label="Поиск"
            className="preview11-input preview11-header-search"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Поиск по заказам, кандидатам и вакансиям"
            type="search"
            value={searchValue}
          />
        </div>

        {isExecutor && canSwitchRole ? (
          <div aria-label="Режим кабинета" className="workspace-executor-role-switch" role="group">
            <button aria-pressed="true" type="button">Исполнитель</button>
            <button aria-pressed="false" disabled={isSwitchingRole} onClick={onSwitchRole} type="button">Соискатель</button>
          </div>
        ) : null}

        <div className="preview11-context-tabs">
          <button
            aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            className="preview11-context-tab"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            type="button"
          >
            <span className="preview11-context-icon" aria-hidden="true">
              {theme === 'dark' ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />}
            </span>
          </button>
          {!isExecutor ? <button
            className={`preview11-context-tab${activeView === 'meetings' ? ' preview11-context-tab-active' : ''}`}
            aria-label={`Встречи: ${meetingsCount}`}
            onClick={onOpenMeetings}
            type="button"
          >
            <span className="preview11-context-icon" aria-hidden="true">
              <CalendarDays size={15} strokeWidth={2} />
            </span>{' '}
            <span className="preview11-badge">{meetingsCount}</span>
          </button> : null}
          <button
            className={`preview11-context-tab${activeView === 'chats' ? ' preview11-context-tab-active' : ''}`}
            aria-label={`Уведомления: ${notificationsCount}`}
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
                  {!isExecutor ? <span className="preview11-profile-role-row">
                    <span className="preview11-profile-role-spacer" aria-hidden="true" />
                    <span className="preview11-profile-role-text">{profileRoleLabel}</span>
                    <span className="preview11-profile-role-spacer" aria-hidden="true" />
                  </span> : null}
                  {isExecutor ? <span className="preview11-profile-role-text">{profileRoleLabel}</span> : <span className="preview11-profile-email">{profileEmail}</span>}
                </span>
                <span className="preview11-avatar">{profileInitials(profileDisplayName)}</span>
              </span>
            }
          />
          {/* Кнопка переключения роли вынесена отдельно, чтобы избежать вложенности <button> в <button> */}
          {canSwitchRole && !isExecutor && (
            <button
              className="preview11-profile-role-pill"
              disabled={isSwitchingRole}
              onClick={onSwitchRole}
              type="button"
              aria-label={`Переключить активную роль. Сейчас: ${profileRoleLabel}`}
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
