import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { workspaceToneToBadgeVariant } from '../model/data'
import { OrderDetailsPagePanel } from './OrderDetailsPagePanel'
import type { MainFeedPanelViewProps } from './MainFeedPanel.types'

export function OrdersExchangeSection({
  canPublishVacancyForCustomer = false,
  canManageOrderResponses = false,
  canRespondToOrder = false,
  filteredOrders,
  hasRespondedToOrder = false,
  isOrderResponsesLoading = false,
  isPublishingVacancyForCustomer = false,
  isRejectingOrderExecutor = false,
  isRespondingToOrder = false,
  isSelectingOrderExecutor = false,
  isUpdatingApplicantResponderStage = false,
  onCreateVacancyFromOrder,
  onOpenChat,
  onCloseOrderDetails,
  onOpenCandidate,
  onOpenOrder,
  onPublishVacancyForCustomer,
  onMoveApplicantResponderToShortlist,
  onRejectApplicantResponder,
  onRejectOrderExecutor,
  onRespondToOrder,
  onSelectOrder,
  onSelectOrderExecutor,
  orderResponses = [],
  orders,
  requesterUserId,
  role = 'Executor',
  selectedOrderDetails = null,
  selectedOrderApplicantResponders = [],
  selectedOrderExecutorName = null,
  selectedOrderId,
  selectedOrderVacancyPreview = null,
}: MainFeedPanelViewProps) {
  const [isApplicantVacancyFiltersOpen, setIsApplicantVacancyFiltersOpen] = useState(false)
  const isApplicantRole = role === 'Applicant'
  const isExecutorRole = role === 'Executor'

    const isOrderDetailsOpen = Boolean(selectedOrderDetails)
    const listedOrders = isApplicantRole ? orders : filteredOrders

    return (
      <div className="space-y-4 lg:flex lg:items-start lg:gap-4 lg:space-y-0">
        <Card
          className={cn(
            'rounded-xl border-slate-200 p-4 shadow-none transition-all duration-300 ease-out lg:flex-shrink-0',
            // Below lg the details replace the list instead of being pushed under it.
            selectedOrderDetails ? 'max-lg:hidden lg:w-1/3' : 'lg:w-full',
          )}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900">
              {isApplicantRole ? 'Список вакансий' : 'Биржа проектов'}
            </h3>
            {isApplicantRole ? (
              <button
                aria-label="Открыть фильтры вакансий"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
                onClick={() => setIsApplicantVacancyFiltersOpen(true)}
                title="Фильтры вакансий"
                type="button"
              >
                <SlidersHorizontal aria-hidden="true" size={18} />
              </button>
            ) : null}
          </div>
          <Table stackOnMobile>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Вакансия</TableHead>
                {!isOrderDetailsOpen ? <TableHead>Компания</TableHead> : null}
                {!isOrderDetailsOpen ? <TableHead>Локация</TableHead> : null}
                {!isOrderDetailsOpen && isApplicantRole ? <TableHead>Оплата</TableHead> : null}
                {!isOrderDetailsOpen && !isApplicantRole ? <TableHead>Приоритет</TableHead> : null}
                {!isOrderDetailsOpen && !isApplicantRole ? <TableHead>Статус</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {listedOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-sm text-slate-500"
                    colSpan={isOrderDetailsOpen ? 1 : isApplicantRole ? 4 : 5}
                  >
                    {isApplicantRole
                      ? 'На площадке пока нет доступных вакансий.'
                      : 'На бирже проектов пока нет доступных проектов.'}
                  </TableCell>
                </TableRow>
              ) : (
                listedOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={cn('cursor-pointer', selectedOrderId === order.id && 'bg-blue-50/70')}
                    onClick={() => {
                      onSelectOrder(order.id)
                      onOpenOrder(order)
                    }}
                  >
                    <TableCell className="font-medium">{order.title}</TableCell>
                    {!isOrderDetailsOpen ? <TableCell data-label="Компания">{order.company}</TableCell> : null}
                    {!isOrderDetailsOpen ? <TableCell data-label="Локация">{order.location}</TableCell> : null}
                    {!isOrderDetailsOpen && isApplicantRole ? (
                      <TableCell data-label="Оплата">{order.employeeCompensation || '—'}</TableCell>
                    ) : null}
                    {!isOrderDetailsOpen && !isApplicantRole ? (
                      <TableCell>
                        <Badge
                          variant={
                            order.priority === 'high'
                              ? 'destructive'
                              : order.priority === 'medium'
                                ? 'default'
                                : 'neutral'
                          }
                        >
                          {order.priority === 'high' ? 'Высокий' : order.priority === 'medium' ? 'Средний' : 'Низкий'}
                        </Badge>
                      </TableCell>
                    ) : null}
                    {!isOrderDetailsOpen && !isApplicantRole ? (
                      <TableCell>
                        <Badge variant={workspaceToneToBadgeVariant(order.statusTone)}>{order.statusLabel}</Badge>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <div
          className={cn(
            'transition-all duration-300 ease-out lg:w-2/3',
            selectedOrderDetails
              ? 'translate-x-0 opacity-100'
              : 'pointer-events-none translate-x-10 opacity-0 lg:w-0 lg:overflow-hidden',
          )}
        >
          {selectedOrderDetails ? (
            <OrderDetailsPagePanel
              key={`${selectedOrderDetails.id}:${selectedOrderDetails.executorId ?? 'none'}`}
              assignedExecutorName={selectedOrderExecutorName}
              canManageOrderResponses={canManageOrderResponses}
              canCreateVacancyFromOrder={
                role === 'Executor' &&
                selectedOrderDetails.executorId === requesterUserId &&
                (!selectedOrderVacancyPreview || selectedOrderVacancyPreview.status === 'Draft')
              }
              canPublishVacancyForCustomer={canPublishVacancyForCustomer}
              canRespondToOrder={canRespondToOrder}
              hasCreateVacancyDraft={selectedOrderVacancyPreview?.status === 'Draft'}
              hasRespondedToOrder={hasRespondedToOrder}
              isOrderResponsesLoading={isOrderResponsesLoading}
              isPublishingVacancyForCustomer={isPublishingVacancyForCustomer}
              isRejectingOrderExecutor={isRejectingOrderExecutor}
              isRespondingToOrder={isRespondingToOrder}
              isSelectingOrderExecutor={isSelectingOrderExecutor}
              isUpdatingApplicantResponderStage={isUpdatingApplicantResponderStage}
              isExecutorViewer={isExecutorRole}
              isApplicantViewer={isApplicantRole}
              onBack={onCloseOrderDetails ?? (() => {})}
              onOpenChat={onOpenChat}
              onOpenApplicantResponder={onOpenCandidate}
              onMoveApplicantResponderToShortlist={(candidateId) => {
                if (!onMoveApplicantResponderToShortlist) {
                  return
                }
                void onMoveApplicantResponderToShortlist(selectedOrderDetails.id, candidateId)
              }}
              onCreateVacancyFromOrder={() => {
                if (!onCreateVacancyFromOrder) {
                  return
                }
                onCreateVacancyFromOrder(selectedOrderDetails.id)
              }}
              onRejectApplicantResponder={(candidateId) => {
                if (!onRejectApplicantResponder) {
                  return
                }
                void onRejectApplicantResponder(selectedOrderDetails.id, candidateId)
              }}
              onPublishVacancyForCustomer={() => {
                if (!onPublishVacancyForCustomer) {
                  return
                }
                void onPublishVacancyForCustomer()
              }}
              onRejectOrderExecutor={(executorId) => {
                if (!onRejectOrderExecutor) {
                  return
                }
                void onRejectOrderExecutor(selectedOrderDetails.id, executorId)
              }}
              onRespondToOrder={() => {
                if (!onRespondToOrder) {
                  return
                }
                void onRespondToOrder(selectedOrderDetails.id)
              }}
              onSelectOrderExecutor={(executorId) => {
                if (!onSelectOrderExecutor) {
                  return
                }
                void onSelectOrderExecutor(selectedOrderDetails.id, executorId)
              }}
              order={selectedOrderDetails}
              orderResponses={orderResponses}
              applicantResponders={selectedOrderApplicantResponders}
              vacancyPreview={selectedOrderVacancyPreview}
            />
          ) : null}
        </div>
        <Modal
          description="Настройка фильтрации вакансий будет добавлена следующим этапом."
          footer={
            <div className="flex justify-end">
              <button
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setIsApplicantVacancyFiltersOpen(false)}
                type="button"
              >
                Закрыть
              </button>
            </div>
          }
          onOpenChange={setIsApplicantVacancyFiltersOpen}
          open={isApplicantRole && isApplicantVacancyFiltersOpen}
          title="Фильтры вакансий"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {['Специализация', 'Формат работы', 'Локация'].map((filterName) => (
              <div key={filterName} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-sm font-medium text-slate-800">{filterName}</p>
                <p className="mt-1 text-xs text-slate-500">Скоро появится</p>
              </div>
            ))}
          </div>
        </Modal>
      </div>
    )
}
