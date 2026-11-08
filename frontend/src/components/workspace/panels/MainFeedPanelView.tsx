import type { MainFeedPanelViewProps } from './MainFeedPanel.types'
import { CandidatesSection } from './CandidatesSection'
import { DashboardOrdersSection } from './DashboardOrdersSection'
import { OrdersExchangeSection } from './OrdersExchangeSection'

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

export function MainFeedPanelView(props: MainFeedPanelViewProps) {
  if (props.isLoading) {
    return renderLoading()
  }

  if (props.view === 'dashboard') {
    return <DashboardOrdersSection {...props} />
  }

  if (props.view === 'orders') {
    return <OrdersExchangeSection {...props} />
  }

  return <CandidatesSection {...props} />
}
