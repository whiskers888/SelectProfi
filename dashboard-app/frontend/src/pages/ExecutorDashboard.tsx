import { DashboardPage } from './DashboardPage';
import type { DashboardPageProps } from './DashboardPage';

export function ExecutorDashboard(props: DashboardPageProps) {
  return <DashboardPage {...props} tableKind="executor" />;
}
