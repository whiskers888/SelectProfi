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

    return (
      <div className="space-y-4">
        {isCustomer && props.isOrdersError
          ? renderError('Не удалось загрузить заказы', props.onRetryOrders)
          : null}
        {!isApplicant && (!isCustomer || !props.isOrdersError || props.orders.length > 0) ? (
          <DashboardOrdersSection {...props} />
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
        {isCustomer || props.role === 'Executor' ? (
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
