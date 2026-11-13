import { Icon } from './Icon';
import type { Order, OrderCandidate, RoleKey } from '../types';

export type TableKind = RoleKey;

const ALERT_BORDER: Record<string, string> = {
  warn: 'border-warn',
  ok: 'border-ok',
  info: 'border-info',
  idle: 'border-idle'
};

const ALERT_ICON_COLOR: Record<string, string> = {
  warn: 'text-warn',
  ok: 'text-ok',
  info: 'text-info',
  idle: 'text-idle'
};

const STAGE_CLASSES: Record<string, string> = {
  shortlist: 'bg-primary-soft text-primary',
  pool: 'bg-idle-bg text-idle'
};

const TABLE_HEADERS: Record<TableKind, string[]> = {
  executor: ['Кандидат (ФИО)', 'Опыт и квалификация', 'Этап воронки', 'Источник', 'Контакты до', 'Действие'],
  customer: ['Кандидат (псевдоним)', 'Опыт и стек', 'Ожидания', 'Соответствие', 'Добавлен', 'Действие'],
  applicant: ['Раздел', 'Содержание требований и условий']
};

interface DetailPaneProps {
  order: Order;
  tableKind: TableKind;
}

export function DetailPane({ order, tableKind }: DetailPaneProps) {
  const hasDetail = order.detailMeta !== null;

  return (
    <main className="min-w-0 overflow-y-auto bg-bg px-4 py-5 md:px-7">
      {order.breadcrumbPrefix && (
        <div className="mb-2 text-xs text-faint">
          {order.breadcrumbPrefix} / <b className="font-medium text-muted">{order.number} · {order.title}</b>
        </div>
      )}

      <div className="mb-3.5">
        <h2 className="text-[22px] font-semibold leading-[1.25] text-body">{order.title}</h2>
        {order.detailMeta && <div className="mt-0.5 text-xs text-muted">{order.detailMeta}</div>}
      </div>

      {hasDetail && order.alertBody && order.alertKind && order.alertIcon && (
        <div className={`mb-4 flex gap-3.5 rounded-md border border-line bg-white p-3.5 shadow-card border-l-4 ${ALERT_BORDER[order.alertKind] ?? ALERT_BORDER.warn}`}>
          <Icon name={order.alertIcon} className={`mt-0.5 ${ALERT_ICON_COLOR[order.alertKind] ?? 'text-warn'}`} />
          <div>
            {order.alertBody.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-2.5 text-[13.5px] leading-[1.45] text-body last:mb-0">
                {paragraph}
              </p>
            ))}
            {order.alertButtons.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {order.alertButtons.map((button) => (
                  <button
                    key={button.id}
                    className={
                      button.isPrimary
                        ? 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-primary bg-primary px-3.5 py-[7px] text-[13px] font-medium text-white hover:bg-primary-strong'
                        : 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-line-strong bg-white px-3.5 py-[7px] text-[13px] font-medium text-body hover:bg-sub'
                    }
                  >
                    <Icon name={button.icon} />
                    {button.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {order.steps.length > 0 && (
        <ul className="mb-4 flex list-none overflow-hidden rounded-md border border-line bg-white">
          {order.steps.map((step, i) => (
            <li
              key={step.index}
              className={`flex flex-1 items-center gap-1.5 whitespace-nowrap border-r border-line py-2.5 pl-3 pr-2 text-xs last:border-r-0 ${
                step.state === 'now'
                  ? 'bg-primary-soft font-semibold text-primary'
                  : step.state === 'done'
                    ? 'text-muted'
                    : 'text-faint'
              }`}
            >
              {step.state === 'done' && <Icon name="done" className="text-sm font-bold text-ok" />}
              {i + 1}. {step.label}
            </li>
          ))}
        </ul>
      )}

      {order.facts.length > 0 && (
        <div className="mb-4 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {order.facts.map((fact) => (
            <div key={fact.label} className="bg-white px-3.5 py-2.5">
              <dt className="text-[11.5px] text-faint">{fact.label}</dt>
              <dd className="mt-0.5 text-[13px] font-medium text-body">{fact.value}</dd>
            </div>
          ))}
        </div>
      )}

      {order.tabs.length > 0 && (
        <div className="mb-3.5 flex gap-5 border-b border-line">
          {order.tabs.map((tab) => (
            <button
              key={tab.label}
              className={`-mb-px border-b-2 pb-2 text-[13px] ${
                tab.isActive
                  ? 'border-primary font-semibold text-body'
                  : 'border-transparent font-medium text-muted'
              }`}
            >
              {tab.label}
              {tab.count !== null && ` (${tab.count})`}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
        <TableCard order={order} tableKind={tableKind} />
        <Aside order={order} />
      </div>
    </main>
  );
}

function TableBadge({ order }: { order: Order }) {
  if (!order.tableBadge) return null;
  if (order.tableBadgeKind === 'rights') {
    return (
      <span className="rounded bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary">
        {order.tableBadge}
      </span>
    );
  }
  if (order.tableBadgeKind === 'alias') {
    return (
      <span className="rounded bg-black/5 px-1.5 py-0.5 text-[11px] text-muted">{order.tableBadge}</span>
    );
  }
  return <span className="text-[11px] text-faint">{order.tableBadge}</span>;
}

function TableCard({ order, tableKind }: { order: Order; tableKind: TableKind }) {
  if (tableKind !== 'applicant' && order.candidates.length === 0) return null;
  if (tableKind === 'applicant' && order.vacancySections.length === 0) return null;
  if (!order.tableTitle) return null;

  return (
    <div className="overflow-hidden rounded-md border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line bg-sub px-3.5 py-3 text-[13px] font-semibold">
        <span>{order.tableTitle}</span>
        <TableBadge order={order} />
      </div>

      <table className="w-full text-[13px]">
        <thead>
          <tr>
            {TABLE_HEADERS[tableKind].map((header) => (
              <th
                key={header}
                className="border-b border-line px-3.5 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableKind === 'applicant'
            ? order.vacancySections.map((section) => (
                <tr key={section.sectionLabel} className="hover:bg-sub">
                  <td className="w-[130px] whitespace-nowrap border-b border-line px-3.5 py-3 align-top font-semibold text-primary last:border-b-0">
                    {section.sectionLabel}
                  </td>
                  <td className="border-b border-line px-3.5 py-3 align-top last:border-b-0">
                    {section.content}
                  </td>
                </tr>
              ))
            : order.candidates.map((candidate) => (
                <CandidateRow key={candidate.id} candidate={candidate} tableKind={tableKind} />
              ))}
        </tbody>
      </table>

      {order.footNote && (
        <div className="flex items-center gap-1.5 border-t border-line bg-sub px-3.5 py-2.5 text-xs text-muted">
          {order.footNoteIcon && <Icon name={order.footNoteIcon} className="text-primary" />}
          {order.footNote}
        </div>
      )}
    </div>
  );
}

function CandidateRow({ candidate, tableKind }: { candidate: OrderCandidate; tableKind: TableKind }) {
  return (
    <tr className="hover:bg-sub">
      <td className="border-b border-line px-3.5 py-2.5 align-middle last:border-b-0">
        {tableKind === 'customer' ? (
          <div className="flex items-center gap-1.5 font-semibold text-body">
            {candidate.isAnonymous && <Icon name="lock" className="text-sm text-faint" />}
            {candidate.displayName}
          </div>
        ) : (
          <>
            <div className="font-semibold text-body">{candidate.displayName}</div>
            {candidate.contactLine && <div className="text-[11px] text-muted">{candidate.contactLine}</div>}
          </>
        )}
      </td>
      <td className="border-b border-line px-3.5 py-2.5 align-middle last:border-b-0">{candidate.experienceText}</td>
      {tableKind === 'executor' && (
        <>
          <td className="border-b border-line px-3.5 py-2.5 align-middle last:border-b-0">
            {candidate.stage && (
              <span
                className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                  STAGE_CLASSES[candidate.stage] ?? STAGE_CLASSES.pool
                }`}
              >
                {candidate.stage}
              </span>
            )}
          </td>
          <td className="border-b border-line px-3.5 py-2.5 align-middle last:border-b-0">{candidate.sourceText}</td>
        </>
      )}
      {tableKind === 'customer' && (
        <>
          <td className="border-b border-line px-3.5 py-2.5 align-middle last:border-b-0">{candidate.salaryText}</td>
          <td className="border-b border-line px-3.5 py-2.5 align-middle last:border-b-0">
            {candidate.matchPercent && (
              <span className="rounded bg-ok-bg px-1.5 py-0.5 text-xs font-semibold text-ok">
                {candidate.matchPercent}
              </span>
            )}
          </td>
        </>
      )}
      <td className="border-b border-line px-3.5 py-2.5 align-middle last:border-b-0">
        {tableKind === 'executor' && candidate.accessState === 'verified' && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-ok">
            <Icon name="verified" className="text-sm" />
            {candidate.accessText}
          </span>
        )}
        {tableKind === 'executor' && candidate.accessState === 'locked' && (
          <span className="text-xs font-medium text-warn">{candidate.accessText}</span>
        )}
        {tableKind === 'executor' && candidate.accessState === null && (
          <span className="text-xs text-faint">{candidate.accessText ?? '—'}</span>
        )}
        {tableKind === 'customer' && <span className="text-xs text-muted">{candidate.accessText}</span>}
      </td>
      <td className="border-b border-line px-3.5 py-2.5 align-middle last:border-b-0">
        <button className="font-medium text-primary hover:underline">{candidate.actionLabel}</button>
      </td>
    </tr>
  );
}

function Aside({ order }: { order: Order }) {
  const hasDocs = order.attachments.length > 0 && order.docsTitle;
  const hasHistory = order.historyEvents.length > 0 && order.historyTitle;
  if (!hasDocs && !hasHistory) return null;

  return (
    <div>
      {hasDocs && order.docsTitle && (
        <>
          <h3 className="mb-2 text-[13px] font-semibold text-body">{order.docsTitle}</h3>
          <div className="mb-3.5 overflow-hidden rounded-md border border-line bg-white">
            {order.attachments.map((doc) => (
              <div key={doc.title} className="flex items-start gap-2.5 border-b border-line px-3 py-2.5 last:border-b-0">
                <Icon name={doc.icon} className="mt-0.5 text-lg text-primary" />
                <div>
                  <div className="text-[12.5px] font-medium text-body">{doc.title}</div>
                  <div className="text-[11px] text-muted">{doc.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {hasHistory && order.historyTitle && (
        <>
          <h3 className="mb-2 text-[13px] font-semibold text-body">{order.historyTitle}</h3>
          <div className="overflow-hidden rounded-md border border-line bg-white px-3 py-1.5">
            <ul className="list-none">
              {order.historyEvents.map((event) => (
                <li key={event.when + event.action} className="relative border-l-2 border-line py-1.5 pl-3 text-xs leading-[1.4]">
                  <span className="absolute -left-[5px] top-2.5 h-2 w-2 rounded-full border-2 border-line-strong bg-white" />
                  <time className="block text-[10.5px] text-faint">{event.when}</time>
                  <strong>{event.actor}</strong> {event.action}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
