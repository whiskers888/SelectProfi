import { Icon } from './Icon';
import type { NavItem, Wallet } from '../types';

interface SidebarProps {
  roleBadge: string;
  actionLabel: string;
  actionIcon: string;
  navItems: NavItem[];
  wallet: Wallet | null;
}

export function Sidebar({ roleBadge, actionLabel, actionIcon, navItems, wallet }: SidebarProps) {
  return (
    <aside className="flex min-h-0 flex-col overflow-y-auto border-r border-line bg-surface px-2.5 py-3.5">
      <div className="flex items-center justify-between px-1 pb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">
        <span>РОЛЬ АККАУНТА</span>
        <span className="rounded bg-primary-soft px-2 py-0.5 text-[11px] font-semibold uppercase text-primary">
          {roleBadge}
        </span>
      </div>

      <button className="mb-3.5 mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-white transition hover:bg-primary-strong">
        <Icon name={actionIcon} className="text-xl" />
        {actionLabel}
      </button>

      <ul className="flex flex-col gap-0.5">
        {navItems.map((item) => (
          <li key={item.id}>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className={
                item.isActive
                  ? 'flex items-center gap-2.5 rounded-md bg-primary-soft px-3 py-2 text-[13px] font-semibold text-primary-strong'
                  : 'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium text-muted hover:bg-sub hover:text-body'
              }
            >
              <Icon name={item.icon} className="text-xl" />
              {item.label}
              {item.count !== null && (
                <span
                  className={
                    item.isActive
                      ? 'ml-auto rounded-[10px] bg-primary/10 px-[7px] py-0.5 text-xs font-semibold text-primary'
                      : 'ml-auto rounded-[10px] bg-black/5 px-[7px] py-0.5 text-xs text-faint'
                  }
                >
                  {item.count}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>

      {wallet && <WalletCard wallet={wallet} />}
    </aside>
  );
}

function WalletCard({ wallet }: { wallet: Wallet }) {
  return (
    <div className="mt-auto rounded-lg border border-line bg-sub p-3">
      <div className="mb-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-faint">
        <Icon name={wallet.icon} className="text-base text-primary" />
        {wallet.title}
      </div>
      {wallet.rows.map((row) => (
        <div key={row.label} className="mt-1.5 flex justify-between text-xs leading-[1.4] first:mt-0">
          <span className="text-muted">{row.label}</span>
          <b className={row.valueTone === 'primary' ? 'font-semibold text-primary' : 'font-semibold text-body'}>
            {row.value}
          </b>
        </div>
      ))}
      <div className="mt-2.5 border-t border-line pt-2 text-[11px] leading-[1.4] text-muted">
        <div>{wallet.footerText}</div>
        {wallet.orgLine && <div>{wallet.orgLine}</div>}
      </div>
    </div>
  );
}
