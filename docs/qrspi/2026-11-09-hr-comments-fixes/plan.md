---
status: approved
---

# Plan

Single task, frontend only, no contract changes.

## Task 1 — HR wording and visibility fixes

Files:
- `components/workspace/shell/workspaceShell.helpers.ts` — G1, G2.
- `components/workspace/shell/WorkspaceShellView.tsx` — G3 (route "Обзор" by stat id), G5 (pass role).
- `components/workspace/panels/PipelinePanel.tsx` — G4, G5.
- `components/workspace/panels/CalendarPanel.tsx` — G4.
- `components/workspace/panels/MainFeedPanelView.tsx` — G6, G7.
- `components/workspace/panels/OrderDetailsPagePanel.tsx` — G7 (applicant wording via prop).
- `components/workspace/styles/shell.css` — G8.

Test expectations:
- Executor stats: label "Кандидаты в работе"; note contains "проектов на согласовании".
- Customer stats: projects note does not contain "согласования"; header title "Заказы".
- Applicant dashboard: no "На паузе" button; paused orders listed under "Архив".
- Applicant order details: heading "Детали вакансии", button "Откликнуться на вакансию",
  no "Отклики" row.
- Analytics: executor title "Воронка подбора", applicant "Статистика поиска работы".
- Existing tests stay green; `npm run lint` and `npm run build` pass.
