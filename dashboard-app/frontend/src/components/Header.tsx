import { useState } from 'react';
import { Icon } from './Icon';
import type { RoleKey } from '../types';

const ROLE_LABELS: Record<RoleKey, string> = {
  executor: 'Исполнитель',
  customer: 'Заказчик',
  applicant: 'Соискатель'
};

interface HeaderProps {
  fullName: string;
  roleSubtitle: string;
  initials: string;
  notificationCount: number;
  currentRole: RoleKey;
  onRoleChange: (role: RoleKey) => void;
}

export function Header({
  fullName,
  roleSubtitle,
  initials,
  notificationCount,
  currentRole,
  onRoleChange
}: HeaderProps) {
  const [search, setSearch] = useState('');

  return (
    <header className="flex h-14 shrink-0 items-center gap-5 border-b border-top-line bg-top px-5 text-top-text">
      <div className="flex items-center gap-2.5">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-white text-xs font-bold text-top">
          КТ
        </div>
        <div className="flex flex-col leading-[1.2]">
          <span className="text-[15px] font-bold text-top-text">КадрыТут</span>
          <span className="text-[11px] font-normal text-top-muted">Маркетплейс подбора персонала</span>
        </div>
      </div>

      <div className="flex max-w-[520px] flex-1 items-center gap-2 rounded-md border border-top-line bg-top-2 px-3 py-1.5 text-[13px] text-top-muted">
        <Icon name="search" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по заказам, кандидатам, вакансиям (Ctrl + K)"
          className="w-full bg-transparent font-sans text-top-text outline-none placeholder:text-top-muted"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden items-center gap-1 lg:flex">
          {(Object.keys(ROLE_LABELS) as RoleKey[]).map((role) => (
            <button
              key={role}
              onClick={() => onRoleChange(role)}
              className={
                role === currentRole
                  ? 'rounded bg-primary px-2.5 py-1 text-xs font-semibold text-white'
                  : 'rounded px-2.5 py-1 text-xs font-medium text-top-muted hover:text-top-text'
              }
            >
              {ROLE_LABELS[role]}
            </button>
          ))}
        </div>

        <div className="relative flex cursor-pointer items-center" title="Уведомления">
          <Icon name="notifications" />
          {notificationCount > 0 && (
            <span className="absolute -right-1.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-lg bg-[#E0A43A] px-1 text-[10px] font-bold leading-4 text-top">
              {notificationCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 text-right text-[13px]">
          <div>
            <div className="block font-semibold">{fullName}</div>
            <div className="block text-[11px] text-top-muted">{roleSubtitle}</div>
          </div>
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-[1.5px] border-white/20 bg-primary text-[13px] font-semibold text-white">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
