import { DashboardPage } from './DashboardPage';
import type { DashboardPageProps } from './DashboardPage';

export function CustomerDashboard(props: DashboardPageProps) {
  return <DashboardPage {...props} tableKind="customer" />;
}
