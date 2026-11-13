import { useMemo, useState } from 'react';
import { chipGroup, isAllChip } from '../lib/chips';
import type { Order, RoleKey } from '../types';

const PILL_CLASSES: Record<string, string> = {
  warn: 'bg-warn-bg text-warn',
  ok: 'bg-ok-bg text-ok',
  info: 'bg-info-bg text-info',
  idle: 'bg-idle-bg text-idle'
};

function Pill({ kind, text }: { kind: string; text: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded px-[7px] py-0.5 text-[11px] font-semibold ${
        PILL_CLASSES[kind] ?? PILL_CLASSES.idle
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {text}
    </span>
  );
}

interface OrderListProps {
  listTitle: string;
  sortOptions: string[];
  filterChips: string[];
  orders: Order[];
  role: RoleKey;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

interface OrderGroup {
  label: string;
  orders: Order[];
}

export function OrderList({
  listTitle,
  sortOptions,
  filterChips,
  orders,
  role,
  selectedId,
  onSelect
}: OrderListProps) {
  const [activeChip, setActiveChip] = useState(filterChips[0] ?? '');

  const groups = useMemo<OrderGroup[]>(() => {
    const filtered = isAllChip(activeChip)
      ? orders
      : orders.filter((o) => o.groupLabel === chipGroup(activeChip, role));
    const result: OrderGroup[] = [];
    for (const order of filtered) {
      const existing = result.find((g) => g.label === order.groupLabel);
      if (existing) {
        existing.orders.push(order);
      } else {
        result.push({ label: order.groupLabel, orders: [order] });
      }
    }
    return result;
  }, [activeChip, orders, role]);

  return (
    <section className="flex min-h-0 flex-col border-r border-line bg-surface">
      <header className="border-b border-line px-4 pb-2.5 pt-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <h1 className="text-[15px] font-semibold text-body">{listTitle}</h1>
          <select className="rounded border border-line bg-surface px-1.5 py-0.5 text-xs text-muted outline-none">
            {sortOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={
                chip === activeChip
                  ? 'whitespace-nowrap rounded border border-primary bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary'
                  : 'whitespace-nowrap rounded border border-line bg-surface px-2.5 py-0.5 text-xs text-muted hover:border-line-strong'
              }
            >
              {chip}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="border-b border-line bg-sub px-4 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">
              {group.label} · {group.orders.length}
            </div>
            {group.orders.map((order) => (
              <button
                key={order.id}
                onClick={() => onSelect(order.id)}
                className={`grid w-full gap-1 border-b border-line px-4 py-3 text-left ${
                  order.id === selectedId
                    ? 'bg-primary-soft shadow-[inset_3px_0_0_#0F766E]'
                    : 'hover:bg-sub'
                }`}
              >
                <div className="flex justify-between text-[11px] text-faint">
                  <span>№ {order.number}</span>
                  <span>{order.deadlineText}</span>
                </div>
                <strong className="text-[13.5px] font-semibold text-body">{order.title}</strong>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{order.partyText}</span>
                  <Pill kind={order.pillKind} text={order.pillText} />
                </div>
              </button>
            ))}
          </div>
        ))}
        {groups.length === 0 && (
          <div className="px-4 py-6 text-xs text-faint">Нет заказов в этой категории</div>
        )}
      </div>
    </section>
  );
}
