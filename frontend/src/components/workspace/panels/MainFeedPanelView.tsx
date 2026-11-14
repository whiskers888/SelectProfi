import type { MainFeedPanelViewProps } from './MainFeedPanel.types'
import { CandidatesSection } from './CandidatesSection'
import { ApplicantApplicationsSection } from './ApplicantApplicationsSection'
import { DashboardOrdersSection } from './DashboardOrdersSection'
import { OrdersExchangeSection } from './OrdersExchangeSection'
import { ExecutorDashboardSection } from './ExecutorDashboardSection'

function renderLoading() {
  return (
    <div className="preview11-card">
      <div className="preview11-loading" role="status">
        <span aria-hidden="true" className="preview11-loading-spin" />
        <span>Обновляем данные раздела...</span>
      </div>
    </div>
  )
}

function renderError(title: string, onRetry?: () => void) {
  return (
    <div className="preview11-error-card" role="alert">
      <h3>{title}</h3>
      <p>Повторите запрос, чтобы обновить данные.</p>
      {onRetry ? (
        <button className="preview11-btn preview11-btn-primary" onClick={onRetry} type="button">
          Повторить
        </button>
      ) : null}
    </div>
  )
}

export function MainFeedPanelView(props: MainFeedPanelViewProps) {
  if (props.isLoading) {
    return renderLoading()
  }

  if (props.view === 'dashboard' && props.role === 'Executor') {
    return <ExecutorDashboardSection viewProps={props} />
  }

  if (props.view === 'dashboard') {
    const isCustomer = props.role === 'Customer'
    const isApplicant = props.role === 'Applicant'

    const customerDetails =
      isCustomer &&
      props.selectedDashboardOrder &&
      props.visibleDashboardOrders.some((order) => order.id === props.selectedDashboardOrder?.id)
        ? props.selectedDashboardOrder
        : null
    const customerCandidates = customerDetails
      ? props.filteredCandidateRows.filter((candidate) => candidate.orderId === customerDetails.id)
      : []

    return (
      <div className="space-y-4">
        {isCustomer && props.isOrdersError
          ? renderError('Не удалось загрузить заказы', props.onRetryOrders)
          : null}
        {!isApplicant && (!isCustomer || !props.isOrdersError || props.orders.length > 0) ? (
          isCustomer ? (
            <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)]">
              <div className="min-w-0">
                <DashboardOrdersSection {...props} onOpenOrder={() => undefined} stackHeader />
              </div>
              <div className="min-w-0 space-y-4">
                {customerDetails ? (
                  <section aria-label="Детали выбранного заказа" className="rounded-xl border border-border bg-card p-4 text-card-foreground">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold">{customerDetails.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{customerDetails.company} • {customerDetails.location}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{customerDetails.statusLabel}</span>
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm">
                      <div><dt className="text-muted-foreground">Стоимость</dt><dd>{(customerDetails.grossAmount ?? customerDetails.price)?.toLocaleString('ru-RU') ?? 'Стоимость требует уточнения'}{typeof (customerDetails.grossAmount ?? customerDetails.price) === 'number' ? ' ₽' : ''}</dd></div>
                      {customerDetails.employeeCompensation ? <div><dt className="text-muted-foreground">Зарплата</dt><dd>{customerDetails.employeeCompensation}</dd></div> : null}
                      {customerDetails.functional ? <div><dt className="text-muted-foreground">Функционал</dt><dd>{customerDetails.functional}</dd></div> : null}
                      {customerDetails.requirements ? <div><dt className="text-muted-foreground">Требования</dt><dd>{customerDetails.requirements}</dd></div> : null}
                      {customerDetails.otherConditions ? <div><dt className="text-muted-foreground">Условия</dt><dd>{customerDetails.otherConditions}</dd></div> : null}
                    </dl>
                    <button className="mt-4 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent" onClick={() => props.onOpenOrder(customerDetails)} type="button">
                      Открыть детали заказа
                    </button>
                  </section>
                ) : (
                  <section aria-label="Детали выбранного заказа" className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                    Выберите заказ из текущего списка, чтобы открыть его детали.
                  </section>
                )}
                <CandidatesSection
                  {...props}
                  dashboardSummary
                  filteredCandidateRows={customerCandidates}
                  onSelectVacancyCandidate={
                    props.dashboardState === 'archive' ? undefined : props.onSelectVacancyCandidate
                  }
                />
              </div>
            </div>
          ) : <DashboardOrdersSection {...props} />
        ) : null}
        {isApplicant ? (
          <ApplicantApplicationsSection
            applications={props.applicantDashboardApplications ?? []}
            vacancies={props.applicantDashboardVacancies ?? []}
            isError={props.isApplicantDashboardStatsError ?? false}
            isLoading={props.isApplicantDashboardStatsLoading ?? false}
            onRetry={props.onRetryApplicantDashboardStats}
            unclassifiedCandidateLinksCount={props.unclassifiedCandidateLinksCount ?? 0}
          />
        ) : null}
        {!isCustomer && props.role === 'Executor' ? (
          <CandidatesSection {...props} dashboardSummary />
        ) : null}
      </div>
    )
  }

  if (props.view === 'orders') {
    return <OrdersExchangeSection {...props} />
  }

  return <CandidatesSection {...props} />
}
