---
status: approved
---

# Research summary (questions + answers)

Q1. Where are dashboard cards built? — `components/workspace/shell/workspaceShell.helpers.ts`,
`deriveWorkspaceViewState` → `runtimeStats` per role. Executor cards currently reuse customer
copy ("Кандидаты на рассмотрении", "ожидают вашего финального решения"). Applicant has no cards.

Q2. Where does "Обзор" navigate? — `StatsGrid` calls `onOverview(stat.id)`, but
`WorkspaceShellView` ignores the id and always opens `candidates`.

Q3. Who sees pause/activate actions? — `canManageOrder` is true only for Customer/Admin
(`useWorkspaceShellController.ts:272`), so the executor already has no pause/archive buttons.
The state rail ("Активные / На паузе / Архив") is shown to every role.

Q4. Applicant vacancy table — `MainFeedPanelView` `view === 'orders'`, columns
Вакансия/Компания/Локация/Приоритет/Статус; details come from `OrderDetailsPagePanel`
(title "Детали заказа", button "Откликнуться на заказ", "Отклики" counter).
`WorkspaceOrder.employeeCompensation` holds the salary text.

Q5. Analytics — `PipelinePanel` with a hardcoded title "Pipeline вакансий" and subtitle;
pipeline data is passed as `[]` (no endpoint).

Q6. Calendar subtitle — `CalendarPanel.tsx:55`.

Q7. Chat subtitle (ID-138, ID-150) — already removed; nothing to do.

Q8. Vacancy draft continuation and statuses (ID-140) — already implemented in
`OrderDetailsPagePanel` ("Продолжить черновик вакансии", vacancy status block).

Q9. Candidate creation (ID-141) — implemented per assignee's 2026-07-17 comment.

Baseline: `npm run test:run` — 11 files, 28 tests passed.
