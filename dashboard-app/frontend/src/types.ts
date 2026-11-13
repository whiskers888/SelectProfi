export type RoleKey = 'executor' | 'customer' | 'applicant';

export interface NavItem {
  id: number;
  icon: string;
  label: string;
  count: number | null;
  isActive: boolean;
}

export interface WalletRow {
  label: string;
  value: string;
  valueTone: string;
}

export interface Wallet {
  icon: string;
  title: string;
  footerText: string;
  orgLine: string;
  rows: WalletRow[];
}

export interface AlertButton {
  id: number;
  icon: string;
  label: string;
  isPrimary: boolean;
}

export interface ProcessStep {
  index: number;
  label: string;
  state: string;
}

export interface Fact {
  label: string;
  value: string;
}

export interface DetailTab {
  label: string;
  count: number | null;
  isActive: boolean;
}

export interface OrderCandidate {
  id: number;
  displayName: string;
  isAnonymous: boolean;
  contactLine: string | null;
  experienceText: string;
  stage: string | null;
  sourceText: string | null;
  accessText: string | null;
  accessState: string | null;
  salaryText: string | null;
  matchPercent: string | null;
  actionLabel: string;
}

export interface VacancySection {
  sectionLabel: string;
  content: string;
}

export interface Attachment {
  icon: string;
  title: string;
  meta: string;
}

export interface HistoryEvent {
  when: string;
  actor: string;
  action: string;
}

export interface Order {
  id: number;
  number: string;
  title: string;
  groupLabel: string;
  deadlineText: string;
  partyText: string;
  pillText: string;
  pillKind: string;
  isSelected: boolean;
  detailMeta: string | null;
  breadcrumbPrefix: string | null;
  alertKind: string | null;
  alertIcon: string | null;
  alertBody: string | null;
  tableTitle: string | null;
  tableBadge: string | null;
  tableBadgeKind: string | null;
  footNoteIcon: string | null;
  footNote: string | null;
  docsTitle: string | null;
  historyTitle: string | null;
  alertButtons: AlertButton[];
  steps: ProcessStep[];
  facts: Fact[];
  tabs: DetailTab[];
  candidates: OrderCandidate[];
  vacancySections: VacancySection[];
  attachments: Attachment[];
  historyEvents: HistoryEvent[];
}

export interface Dashboard {
  fullName: string;
  roleKey: RoleKey;
  roleBadge: string;
  roleSubtitle: string;
  initials: string;
  notificationCount: number;
  actionLabel: string;
  actionIcon: string;
  listTitle: string;
  sortOptions: string[];
  filterChips: string[];
  navItems: NavItem[];
  wallet: Wallet | null;
  orders: Order[];
}
