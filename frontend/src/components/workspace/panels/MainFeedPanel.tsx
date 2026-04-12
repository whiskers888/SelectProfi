import type { MainFeedPanelProps } from './MainFeedPanel.types'
import { MainFeedPanelView } from './MainFeedPanelView'
import { useMainFeedPanelController } from './hooks/useMainFeedPanelController'

export function MainFeedPanel(props: MainFeedPanelProps) {
  const viewModel = useMainFeedPanelController(props)
  return <MainFeedPanelView {...props} {...viewModel} />
}
