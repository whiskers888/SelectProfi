---
status: approved
pipeline: quick
route: [goals, questions, research, plan, implement, test]
approved_by: user standing instruction ("без вопросов") on 2026-11-09
---

# Goals — HR comments fixes (YouGile board "HR-комменты")

The HR reviewer left UI feedback per role. Several items are still not reflected in the
frontend, or regressed (customer wording leaked into the executor dashboard). This run fixes
the items that are purely frontend and unambiguous. Items that need backend data or an
unresolved business decision are explicitly deferred.

## In scope

- G1. Executor dashboard cards use executor wording (ID-135): "Проекты в работе" note
  "N проектов на согласовании"; "Кандидаты в работе" with note about responses to vacancies.
- G2. Customer wording (ID-152): header "Заказы"; remove "проектов на этапе согласования"
  note from the customer "Заказы в работе" card.
- G3. "Обзор" buttons lead to a section that matches the card (ID-135, ID-147).
- G4. Remove obsolete subtitles: calendar (ID-137), analytics (ID-151).
- G5. Analytics title per role: executor/customer "Воронка подбора" (ID-142),
  applicant "Статистика поиска работы" (ID-151).
- G6. Applicant "Мои отклики" dashboard (ID-148): no "На паузе" tab (paused vacancies fall
  into "Архив"); remove the non-functional "Фильтры" button.
- G7. Applicant vacancy list and details wording (ID-149): "Список вакансий",
  columns "Оплата" instead of priority/status, "Детали вакансии",
  "Откликнуться на вакансию", no "Отклики" counter for the applicant.
- G8. Dashboard checkboxes align on one vertical line incl. "Выбрать все" (ID-136).

## Out of scope (deferred, needs backend or a business decision)

- Reserved money sum and "БАЛАНС" block (ID-152 p.4, p.7), document flow (ID-152 p.8).
- Pause/archive money logic and auto-archive (ID-136 backend list).
- "Скрыть"/"Скрытые" vacancies for the applicant (ID-148 p.4-5) — needs persistence.
- New funnel stages and downloadable report (ID-142) — no analytics endpoint yet.
- Meeting vacancy title (ID-137 p.2) — meetings are a stub.
- Payment role maps (ID-124, ID-125), business processes (ID-127), resume trading (ID-126).
- ID-146, ID-147 text changes shown only in attached images that are not readable here.
