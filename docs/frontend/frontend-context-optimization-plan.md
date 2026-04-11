# Frontend Context Optimization Plan

Last updated: 2026-04-11
Owner: frontend
Status: In progress

## 1. Цель

Снизить контекстную стоимость frontend-кода и сделать `pages/*` тонкими orchestration-слоями.

Ключевой критерий:
- `pages/*` не содержат доменные хелперы, парсинг ошибок, маппинг payload, сложные роли/policy-ветки.
- Всё это уходит в `features/*` (`lib/model/ui`).

## 2. Актуальный аудит всех pages

Текущее состояние (`wc -l`, 2026-04-11):
- `frontend/src/pages/VacanciesPage.tsx` — 1055
- `frontend/src/pages/ProfilePage.tsx` — 806
- `frontend/src/pages/RegisterPage.tsx` — 592
- `frontend/src/pages/AuthPage.tsx` — 519
- `frontend/src/pages/OrdersPage.tsx` — 437
- `frontend/src/pages/LoginPage.tsx` — 252
- `frontend/src/pages/WorkspacePage.tsx` — 6

Тесты (`pages/*.test.tsx`) в текущий scope минимизации не входят.

## 3. Целевые бюджеты строк

Жёсткие целевые лимиты для `pages/*`:
- `WorkspacePage`: `<= 20` (уже ок)
- `LoginPage`: `<= 180`
- `OrdersPage`: `<= 220`
- `RegisterPage`: `<= 220`
- `ProfilePage`: `<= 220`
- `VacanciesPage`: `<= 260`
- `AuthPage`: `<= 80` или удаление/архивация (предпочтительно)

Принцип: если страница вышла за бюджет, логика выносится в `features/*` в следующем инкременте.

## 4. Архитектурная модель для всех страниц

## 4.1 Что остаётся в `pages/*`
- Загрузка данных для экрана.
- Компоновка секций/поверхностей.
- Передача props в feature-компоненты.
- Переходы/роутинг.

## 4.2 Что выносится из `pages/*`
- Парсинг/маппинг API-ошибок.
- Валидации.
- Конвертеры enums/labels.
- Маппинг form state -> API payload.
- use-case handlers и permission/policy матрицы.
- Объёмные role-specific JSX формы.

## 4.3 Папочная конвенция
- `frontend/src/features/<domain>/lib/*` — чистые функции и мапперы.
- `frontend/src/features/<domain>/model/*` — hooks/use-cases/policy.
- `frontend/src/features/<domain>/ui/*` — секции экрана.

## 5. Детальный план по каждой странице

## 5.1 ProfilePage (высокий приоритет)

Сделано:
- Вынесены `errors.ts`, `roles.ts`, `formatters.ts`, `validation.ts`.
- Вынесены UI-секции: `ProfileApplicantSection`, `ProfileCustomerSection`, `ProfileExecutorSection`.

Осталось вынести:
- Enum helpers (по твоему запросу):
  - `toCustomerLegalFormValue`
  - `toCustomerLegalFormLabel`
  - `toEmploymentTypeLabel`
  - `toCustomerLegalFormPayload`
  - Целевой файл: `frontend/src/features/profile/lib/enums.ts`
- Form-state builders:
  - `createCommonProfileFormValues`
  - `createApplicantProfileFormValues`
  - `createCustomerProfileFormValues`
  - `createExecutorProfileFormValues`
  - Целевой файл: `frontend/src/features/profile/lib/form-state.ts`
- Payload builders:
  - `buildApplicantUpdatePayload`
  - `buildCustomerUpdatePayload`
  - `buildExecutorUpdatePayload`
  - Целевой файл: `frontend/src/features/profile/lib/payloads.ts`
- UI секции:
  - `ProfileCommonSection.tsx`
  - `ProfileRoleSwitcher.tsx`
  - `ProfileAdminSection.tsx`
  - `ProfileDetails.tsx` (общий)

Цель:
- `ProfilePage.tsx` до `<= 220` строк.

## 5.2 RegisterPage (высокий приоритет)

Проблема:
- В одном файле смешаны role-анимация, сбор formData, payload mapping, customer-поля, UI.

План:
- `frontend/src/features/auth/lib/registration/`
  - `constants.ts` (offer/version/input styles и т.д.)
  - `role-animation.ts` (вычисление направления анимации роли)
  - `submission.ts` (FormData -> values, values -> payload)
- `frontend/src/features/auth/ui/register/`
  - `RegisterRoleSelector.tsx`
  - `RegisterCustomerFields.tsx`
  - `RegisterCommonFields.tsx`
  - `RegisterSocialButtons.tsx`

Цель:
- `RegisterPage.tsx` до `<= 220` строк.

## 5.3 VacanciesPage (критический приоритет)

Проблема:
- Самый тяжёлый файл, много mixed-responsibility и role-policy в одной странице.

Критерий разбиения:
- Не по ролям, а по use-case сценариям.

План:
- `frontend/src/features/vacancies/lib/`
  - `errors.ts`
  - `policy.ts` (canCreate/canEdit/canManagePipeline/canSelect...)
  - `lifecycle.ts` (`getLifecycleAction`)
  - `pagination.ts` (`parseNonNegativeInteger` и related)
  - `resume.ts` (resume json builders)
- `frontend/src/features/vacancies/model/`
  - `useVacanciesQueryState.ts`
  - `useVacancyCrudActions.ts`
  - `useVacancyPipelineActions.ts`
  - `useVacancyContactsActions.ts`

Цель:
- `VacanciesPage.tsx` до `<= 260` строк.

## 5.4 OrdersPage (средний приоритет)

Проблема:
- Повторяет анти-паттерны `VacanciesPage`: local error parser, pagination parser, policy checks в page.

План:
- `frontend/src/features/orders/lib/`
  - `errors.ts`
  - `pagination.ts`
  - `policy.ts`
- `frontend/src/features/orders/model/`
  - `useOrdersQueryState.ts`
  - `useOrdersCrudActions.ts`
  - `useOrderExecutorsActions.ts`

Цель:
- `OrdersPage.tsx` до `<= 220` строк.

## 5.5 LoginPage (средний приоритет)

Проблема:
- Страница небольшая, но содержит повторяющиеся элементы с Register (соц-кнопки, input style constants, delayed navigate pattern).

План:
- Вынести общий auth-ui/shared:
  - `useDelayedNavigation.ts`
  - `AuthSocialButtons.tsx`
  - `authInputStyles.ts`
- Сохранить существующий UX без изменения сценариев входа.

Цель:
- `LoginPage.tsx` до `<= 180` строк.

## 5.6 AuthPage (отдельное решение)

Факт:
- `AuthPage.tsx` сейчас не используется в роутинге (router ведёт на `LoginPage` и `RegisterPage`).

План:
- Вариант A (предпочтительный): удалить `AuthPage.tsx` и тесты после подтверждения, что legacy-путь не нужен.
- Вариант B: перенести в `frontend/src/legacy/pages/AuthPage.legacy.tsx` и исключить из рабочего контекста.

Цель:
- Не тратить контекст на мёртвый код.

## 5.7 WorkspacePage

Состояние:
- Уже тонкая страница-обёртка, изменений не требуется.

## 6. Общие инженерные правила минимизации

1. Один инкремент = один переносимый блок.
2. `eslint` после каждого инкремента.
3. Никаких изменений backend-контрактов.
4. Никаких изменений UX/бизнес-правил без отдельной задачи.
5. Сначала `lib/model`, затем `ui`, потом чистка `page`.

## 7. Порядок выполнения (обновлённый)

1. Profile: вынести enum helpers в `lib/enums.ts`.
2. Profile: вынести form-state builders в `lib/form-state.ts`.
3. Profile: вынести role payload builders в `lib/payloads.ts`.
4. Profile: вынести `ProfileCommonSection`.
5. Profile: вынести `ProfileRoleSwitcher`, `ProfileAdminSection`, общий `ProfileDetails`.
6. Register: разделить `submission/role-animation/customer-fields`.
7. Vacancies: вынести `errors/policy/lifecycle/pagination/resume`.
8. Vacancies: вынести use-case hooks и почистить page до orchestration.
9. Orders: вынести `errors/policy/pagination` и action hooks.
10. Login: вынести shared auth-блоки.
11. AuthPage: удалить или архивировать после подтверждения.
12. Финальный аудит строк по всем pages.

## 8. Definition of Done

Шаг считается завершённым, если:
- Целевой блок вынесен в `features/*`.
- `page` использует импорт вместо локальной логики.
- `npm run lint` проходит.
- В `Progress log` зафиксированы файлы и результат.
- Обновлён `Next exact step`.

## 9. Progress log

### 2026-04-11
- Создан файл плана `docs/frontend/frontend-context-optimization-plan.md`.
- Зафиксированы baseline-метрики по крупным страницам (`Profile/Register/Vacancies`).
- Выполнен Profile step 1: `features/profile/lib/errors.ts`.
- Выполнен Profile step 2: `features/profile/lib/roles.ts`.
- Выполнен Profile step 3: `features/profile/lib/formatters.ts`.
- Выполнен Profile step 4: `features/profile/lib/validation.ts`.
- Выполнен Profile step 5: `features/profile/ui/ProfileApplicantSection.tsx`.
- Выполнен Profile step 6: `features/profile/ui/ProfileCustomerSection.tsx`.
- Выполнен Profile step 7: `features/profile/ui/ProfileExecutorSection.tsx`.
- Выполнен Profile step 8: enum helpers вынесены в `frontend/src/features/profile/lib/enums.ts`, `frontend/src/pages/ProfilePage.tsx` переведён на импорт (`toCustomerLegalFormValue`, `toCustomerLegalFormLabel`, `toEmploymentTypeLabel`, `toCustomerLegalFormPayload`), `npm run lint` (frontend) проходит.
- Выполнен Profile step 9: form-state builders вынесены в `frontend/src/features/profile/lib/form-state.ts`, `frontend/src/pages/ProfilePage.tsx` переведён на импорт (`createCommonProfileFormValues`, `createApplicantProfileFormValues`, `createCustomerProfileFormValues`, `createExecutorProfileFormValues`), `npm run lint` (frontend) проходит.
- Выполнен Profile step 10: payload builders вынесены в `frontend/src/features/profile/lib/payloads.ts`, `frontend/src/pages/ProfilePage.tsx` переведён на импорт (`buildApplicantUpdatePayload`, `buildCustomerUpdatePayload`, `buildExecutorUpdatePayload`), `npm run lint` (frontend) проходит.
- Выполнен Profile step 11: секция общих данных вынесена в `frontend/src/features/profile/ui/ProfileCommonSection.tsx`, `frontend/src/pages/ProfilePage.tsx` переведён на использование `ProfileCommonSection`, `npm run lint` (frontend) проходит.
- Выполнен Profile step 12: блок переключения активной роли вынесен в `frontend/src/features/profile/ui/ProfileRoleSwitcher.tsx`, `frontend/src/pages/ProfilePage.tsx` переведён на использование `ProfileRoleSwitcher`, `npm run lint` (frontend) проходит.
- Выполнен Profile step 13: блок роли администратора вынесен в `frontend/src/features/profile/ui/ProfileAdminSection.tsx`, `frontend/src/pages/ProfilePage.tsx` переведён на использование `ProfileAdminSection`, `npm run lint` (frontend) проходит.
- Выполнен Profile step 14: общий `Details`-рендерер вынесен в `frontend/src/features/profile/ui/ProfileDetails.tsx` и подключён в `ProfileCommonSection`, `ProfileApplicantSection`, `ProfileCustomerSection`, `ProfileExecutorSection`, `npm run lint` (frontend) проходит.
- Выполнен Register step 1: логика role animation вынесена в `frontend/src/features/auth/lib/registration/role-animation.ts`, `frontend/src/pages/RegisterPage.tsx` переведён на `getRoleAnimationDirection/getRoleAnimationClassName`, `npm run lint` (frontend) проходит.
- Выполнен Register step 2: submission mapping вынесен в `frontend/src/features/auth/lib/registration/submission.ts` (`FormData -> RegistrationFormValues`, `RegistrationFormValues -> executeRegister payload`), `frontend/src/pages/RegisterPage.tsx` переведён на `buildRegistrationValuesFromFormData/buildRegisterPayload`, `npm run lint` (frontend) проходит.
- Выполнен Register step 3: registration constants вынесены в `frontend/src/features/auth/lib/registration/constants.ts` (`customerLegalFormOptions`, `defaultCustomerLegalForm`, `offerLink`, `currentOfferVersion`, `authInputClassName`), `frontend/src/pages/RegisterPage.tsx` переведён на импорт, `npm run lint` (frontend) проходит.
- Выполнен Register step 4: блок выбора роли (mobile `Select` + desktop `Tabs` + описание роли) вынесен в `frontend/src/features/auth/ui/register/RegisterRoleSelector.tsx`, `frontend/src/pages/RegisterPage.tsx` переведён на использование `RegisterRoleSelector`, `npm run lint` (frontend) проходит.
- Выполнен Register step 5: customer-specific блок вынесен в `frontend/src/features/auth/ui/register/RegisterCustomerFields.tsx` (tabs `customerLegalForm`, поля `companyName/customerInn/customerEgrn/customerEgrnip`, блок `offerAccepted` c ссылкой на оферту), `frontend/src/pages/RegisterPage.tsx` переведён на `RegisterCustomerFields` (`section="fields"` и `section="offer"`), `npm run lint` (frontend) проходит.
- Выполнен Register step 6: общий блок полей регистрации вынесен в `frontend/src/features/auth/ui/register/RegisterCommonFields.tsx` (`fullName`, `phone`, `email`, `password`), `frontend/src/pages/RegisterPage.tsx` переведён на `RegisterCommonFields`, `npm run lint` (frontend) проходит.
- Выполнен Register step 7: social-блок регистрации (разделитель + кнопки `Google/VK ID/Яндекс/Mail.ru`) вынесен в `frontend/src/features/auth/ui/register/RegisterSocialButtons.tsx`, `frontend/src/pages/RegisterPage.tsx` переведён на `RegisterSocialButtons`, `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 1: локальный parser ошибок вынесен в `frontend/src/features/vacancies/lib/errors.ts` (`getRequestErrorMessage` + type guards/problem-details mapping), `frontend/src/pages/VacanciesPage.tsx` переведён на импорт из `features/vacancies/lib/errors`, `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 2: parser пагинации `parseNonNegativeInteger` вынесен в `frontend/src/features/vacancies/lib/pagination.ts`, `frontend/src/pages/VacanciesPage.tsx` переведён на импорт из `features/vacancies/lib/pagination`, `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 3: lifecycle helper `getLifecycleAction` вынесен в `frontend/src/features/vacancies/lib/lifecycle.ts`, `frontend/src/pages/VacanciesPage.tsx` переведён на импорт из `features/vacancies/lib/lifecycle`, `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 4: resume helpers `buildResumeContentJson` и `buildResumeAttachmentsJson` вынесены в `frontend/src/features/vacancies/lib/resume.ts`, `frontend/src/pages/VacanciesPage.tsx` переведён на импорт из `features/vacancies/lib/resume`, `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 5: role/policy checks вынесены в `frontend/src/features/vacancies/lib/policy.ts` (`canCreateVacancy`, `canEditVacancy`, `canManagePipeline`, `canSelectCandidate`, `canReadSelectedContacts`, `canReadExecutorContacts`, `canReadVacancyCandidates`), `frontend/src/pages/VacanciesPage.tsx` переведён на импорт policy-функций, `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 6: состояние и handlers пагинации вынесены в `frontend/src/features/vacancies/model/useVacanciesQueryState.ts` (`vacanciesQuery`, `vacanciesLimitInput`, `vacanciesOffsetInput`, `applyVacanciesQuery`, `handleVacanciesQueryInputChange`, `handleApplyVacanciesQuery`, `handlePreviousVacanciesPage`, `handleNextVacanciesPage`), `frontend/src/pages/VacanciesPage.tsx` переведён на `useVacanciesQueryState`, экспорт добавлен в `frontend/src/features/vacancies/model/index.ts`, `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 7: CRUD-actions вакансии вынесены в `frontend/src/features/vacancies/model/useVacancyCrudActions.ts` (`handleCreateVacancy`, `handleUpdateVacancyDetails`, `handleDeleteVacancy`, `handleStatusTransition`), `frontend/src/pages/VacanciesPage.tsx` переведён на `useVacancyCrudActions` с сохранением сообщений/валидаций и `unwrap`-сценариев, экспорт добавлен в `frontend/src/features/vacancies/model/index.ts`, `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 8: pipeline-actions вынесены в `frontend/src/features/vacancies/model/useVacancyPipelineActions.ts` (`handleCreateCandidateResume`, `handleAddCandidateFromBase`, `handleUpdateCandidateStage`), `frontend/src/pages/VacanciesPage.tsx` переведён на `useVacancyPipelineActions` с сохранением guard-проверок, reset/refetch-последовательности и `unwrap`-сценариев, экспорт добавлен в `frontend/src/features/vacancies/model/index.ts`, `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 9: contacts/selection actions вынесены в `frontend/src/features/vacancies/model/useVacancyContactsActions.ts` (`handleSelectCandidate`, `handleGetSelectedCandidateContacts`, `handleGetExecutorCandidateContacts`), `frontend/src/pages/VacanciesPage.tsx` переведён на `useVacancyContactsActions` с сохранением guard-проверок, сообщений и `unwrap`-сценариев, экспорт добавлен в `frontend/src/features/vacancies/model/index.ts`, `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 10: локальный тип `CreateCandidateResumeFormState` вынесен в `frontend/src/features/vacancies/model/types.ts` и переиспользован в `frontend/src/features/vacancies/model/useVacancyPipelineActions.ts` и `frontend/src/pages/VacanciesPage.tsx` (через `frontend/src/features/vacancies/model/index.ts`), `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 11: локальный тип `CreateVacancyFormState` вынесен в `frontend/src/features/vacancies/model/types.ts` и переиспользован в `frontend/src/features/vacancies/model/useVacancyCrudActions.ts` и `frontend/src/pages/VacanciesPage.tsx` (через `frontend/src/features/vacancies/model/index.ts`), `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 12: локальный тип `SubmitMessage` вынесен в `frontend/src/features/vacancies/model/types.ts` (вместе с `SubmitMessageStatus`) и переиспользован в `frontend/src/features/vacancies/model/useVacancyCrudActions.ts`, `frontend/src/features/vacancies/model/useVacancyPipelineActions.ts`, `frontend/src/features/vacancies/model/useVacancyContactsActions.ts` и `frontend/src/pages/VacanciesPage.tsx` (через `frontend/src/features/vacancies/model/index.ts`), `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 13: локальный тип `PipelineFormState` вынесен в `frontend/src/features/vacancies/model/types.ts` и переиспользован в `frontend/src/pages/VacanciesPage.tsx` (через `frontend/src/features/vacancies/model/index.ts`), `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 14: локальный тип `VacancyWorkspaceSection` вынесен в `frontend/src/features/vacancies/model/types.ts` и переиспользован в `frontend/src/pages/VacanciesPage.tsx` (через `frontend/src/features/vacancies/model/index.ts`), `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 15: локальный guard helper `ensurePublishedVacancyForPipeline` переведён на policy helper `isPublishedVacancyStatus`, который вынесен в `frontend/src/features/vacancies/lib/policy.ts`, `frontend/src/pages/VacanciesPage.tsx` обновлён на импорт policy helper, `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 16: локальные handlers редактирования инпутов вынесены в `frontend/src/features/vacancies/model/useVacancyFormState.ts` (`handleCreateFormChange`, `handleCreateOrderSelectChange`, `handleAddFromBaseCandidateSelectChange`, `handleVacancyEditTitleChange`, `handleVacancyEditDescriptionChange`, `handlePipelineStageChange`, `handleCreateCandidateResumeInputChange`), `frontend/src/pages/VacanciesPage.tsx` переведён на `useVacancyFormState`, экспорт добавлен в `frontend/src/features/vacancies/model/index.ts`, `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 17: локальный helper контекста `applyVacancyContext` вынесен в `frontend/src/features/vacancies/model/useVacancyContextState.ts` (с сохранением текущей последовательности reset-полей), `frontend/src/pages/VacanciesPage.tsx` переведён на `useVacancyContextState`, экспорт добавлен в `frontend/src/features/vacancies/model/index.ts`, `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 18: локальный guard helper `ensurePublishedVacancyForPipeline` вынесен в `frontend/src/features/vacancies/model/useVacancyPipelineGuards.ts` (с сохранением проверки через `isPublishedVacancyStatus` и текущего текста ошибки), `frontend/src/pages/VacanciesPage.tsx` переведён на `useVacancyPipelineGuards`, экспорт добавлен в `frontend/src/features/vacancies/model/index.ts`, `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 19: удалён локальный wrapper `handleSelectVacancy` в `frontend/src/pages/VacanciesPage.tsx`, `applyVacancyContext` передан напрямую в `VacanciesListSurface.onSelectVacancy`, `npm run lint` (frontend) проходит.
- Выполнен Vacancies step 20: локальные reset-callbacks `resetCreateForm` и `resetVacancyEditState` вынесены в `frontend/src/features/vacancies/model/useVacancyFormReset.ts`, `frontend/src/pages/VacanciesPage.tsx` переведён на `useVacancyFormReset`, экспорт добавлен в `frontend/src/features/vacancies/model/index.ts`, `npm run lint` (frontend) проходит.
- Выполнен AuthPage cleanup step 1: удалены неиспользуемые legacy-файлы `frontend/src/pages/AuthPage.tsx` и `frontend/src/pages/AuthPage.test.tsx` (роутинг уже использовал `LoginPage/RegisterPage`), `npm run lint` (frontend) проходит.
- Выполнен Orders step 1: локальный parser ошибок `getRequestErrorMessage` (вместе с type guards `isProblemDetailsPayload` и `isFetchBaseQueryError`) вынесен в `frontend/src/features/orders/lib/errors.ts`, `frontend/src/pages/OrdersPage.tsx` переведён на импорт parser-а, `npm run lint` (frontend) проходит.
- Выполнен Orders step 2: локальный parser пагинации `parseNonNegativeInteger` вынесен в `frontend/src/features/orders/lib/pagination.ts`, `frontend/src/pages/OrdersPage.tsx` переведён на импорт parser-а, `npm run lint` (frontend) проходит.
- Выполнен Orders step 3: локальные role/policy вычисления (`canCreateOrder`, `canEditOrder`, `canDeleteOrder`, `canAssignExecutor`) вынесены в `frontend/src/features/orders/lib/policy.ts`, `frontend/src/pages/OrdersPage.tsx` переведён на импорт policy-функций, `npm run lint` (frontend) проходит.
- Выполнен Orders step 4: состояние и handlers пагинации (`ordersQuery`, `ordersLimitInput`, `ordersOffsetInput`, `applyOrdersQuery`, `handleOrdersQueryInputChange`, `handleApplyOrdersQuery`, `handlePreviousOrdersPage`, `handleNextOrdersPage`) вынесены в `frontend/src/features/orders/model/useOrdersQueryState.ts`, `frontend/src/pages/OrdersPage.tsx` переведён на `useOrdersQueryState`, экспорт добавлен в `frontend/src/features/orders/model/index.ts`, `npm run lint` (frontend) проходит.
- Выполнен Orders step 5: локальные handlers формы/таблицы (`handleExecutorSelectChange`, `handleCreateInputChange`, `handleOrderEditInputChange`) вынесены в `frontend/src/features/orders/model/useOrderFormState.ts`, `frontend/src/pages/OrdersPage.tsx` переведён на `useOrderFormState`, экспорт добавлен в `frontend/src/features/orders/model/index.ts`, `npm run lint` (frontend) проходит.
- Выполнен Orders step 6: use-case handlers мутаций заказа (`handleCreateOrder`, `handleAssignExecutor`, `handleUpdateOrderDetails`, `handleDeleteOrder`) вынесены в `frontend/src/features/orders/model/useOrdersCrudActions.ts`, `frontend/src/pages/OrdersPage.tsx` переведён на `useOrdersCrudActions`, экспорт добавлен в `frontend/src/features/orders/model/index.ts`, `npm run lint` (frontend) проходит.
- Выполнен Orders step 7: локальный handler загрузки деталей заказа `handleLoadOrderDetails` вынесен в `frontend/src/features/orders/model/useOrderDetailsActions.ts`, `frontend/src/pages/OrdersPage.tsx` переведён на `useOrderDetailsActions`, экспорт добавлен в `frontend/src/features/orders/model/index.ts`, `npm run lint` (frontend) проходит.
- Выполнен Login step 1: social-блок входа (разделитель + кнопки `Google/VK ID/Яндекс/Mail.ru`) вынесен в `frontend/src/features/auth/ui/AuthSocialButtons.tsx`, `frontend/src/pages/LoginPage.tsx` переведён на `AuthSocialButtons`, `npm run lint` (frontend) проходит.
- Дополнительно проведён полный аудит всех файлов `frontend/src/pages/*`.
- План расширен до полного coverage по всем страницам с целевыми лимитами строк.

## 10. Next exact step

Продолжить `Login`-оптимизацию: вынести локальные константы `authInputClassName` и `authInputStyle`
из `frontend/src/pages/LoginPage.tsx` в `frontend/src/features/auth/lib/authInputStyles.ts`,
подключить импорт в страницу и прогнать `eslint` по frontend.

## 11. Шаблон продолжения в новом чате

"Продолжаем по `docs/frontend/frontend-context-optimization-plan.md` с шага из `Next exact step`.
Сначала выполни только этот шаг, затем обнови `Progress log` и `Next exact step`."
