import { DashboardPage } from './DashboardPage';
import type { DashboardPageProps } from './DashboardPage';

export function ApplicantDashboard(props: DashboardPageProps) {
  return <DashboardPage {...props} tableKind="applicant" />;
}
