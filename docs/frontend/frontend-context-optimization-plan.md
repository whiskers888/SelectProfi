# Frontend Context Optimization Plan

Last updated: 2026-04-11
Owner: frontend
Status: Draft (ready for execution)

## 1. Цель и границы

### 1.1 Цель
Снизить контекстную стоимость frontend-кода для разработки с AI-агентами и ручной поддержки, сохранив текущее поведение UI/бизнес-логики.

### 1.2 Измеримый результат
- Уменьшить размер ключевых page-файлов до управляемого объёма.
- Перевести тяжёлую логику из `pages/*` в `features/*` (ui/model/lib).
- Сделать страницы тонкими композициями, которые легко читать и менять изолированно.

### 1.3 Out of scope
- Изменение backend-контрактов.
- Изменение бизнес-функционала.
- Редизайн интерфейса.

## 2. Исходное состояние (baseline)

Состояние на 2026-04-11:
- `frontend/src/pages/ProfilePage.tsx` — 1492 строк.
- `frontend/src/pages/RegisterPage.tsx` — 592 строки.
- `frontend/src/pages/VacanciesPage.tsx` — 1055 строк.

Проблемы:
- В одном файле смешаны UI, валидации, маппинги payload, политики ролей, обработка ошибок, submit-сценарии.
- Высокая когнитивная нагрузка при изменениях.
- Быстрое выгорание токен-контекста при чтении страницы целиком.

## 3. Архитектурные принципы выполнения

1. Сохраняем текущий функционал и API-контракты без изменений.
2. Разделяем по ответственности, а не только по визуальным блокам.
3. `pages/*` содержат только композицию экрана и wiring между feature-модулями.
4. Доменные/ролевые правила выносятся в `lib/policy` или `model`, а не дублируются в UI.
5. Один маленький шаг = один законченный инкремент с проверкой линтера.
6. Любой шаг должен быть безопасно продолжен в новом чате по этому документу.

## 4. Целевая структура (ориентир)

## 4.1 Profile
Цель: декомпозиция по слоям + ролевые секции.

Планируемые зоны:
- `frontend/src/features/profile/lib/`
  - `formatters.ts` (toTextOrDash, labels и др.)
  - `validation.ts` (валидации common/applicant/customer/executor)
  - `mappers.ts` (payload-мэппинг для update)
  - `errors.ts` (request error mapping)
  - `roles.ts` (resolveActiveRole, resolveAvailableRoles, role helpers)
- `frontend/src/features/profile/ui/`
  - `ProfileCommonFormSection.tsx`
  - `ProfileApplicantSection.tsx`
  - `ProfileCustomerSection.tsx`
  - `ProfileExecutorSection.tsx`
  - `ProfileAdminSection.tsx`
  - `ProfileRoleSwitcher.tsx`
  - `ProfileDetails.tsx`
- `frontend/src/pages/ProfilePage.tsx`
  - orchestration-only (загрузка данных, режимы редактирования, вызов секций).

## 4.2 Register
Цель: разделить submit-логику, роль-логику и UI секции.

Планируемые зоны:
- `frontend/src/features/auth/lib/registration/`
  - `constants.ts` (локальные для register-page константы)
  - `role-animation.ts` (чистая логика направления анимации)
  - `submission.ts` (сбор `RegistrationFormValues` из FormData и payload mapping)
- `frontend/src/features/auth/ui/register/`
  - `RegisterRoleSelector.tsx`
  - `RegisterCustomerFields.tsx`
  - `RegisterCommonFields.tsx`
  - `RegisterSubmitStatus.tsx` (если нужно)
- `frontend/src/pages/RegisterPage.tsx`
  - orchestration-only.

## 4.3 Vacancies
Критерий разбиения: не по ролям, а по use-case сценариям.

Планируемые зоны:
- `frontend/src/features/vacancies/lib/`
  - `errors.ts` (request error mapping)
  - `policy.ts` (матрица прав/доступов по роли и статусу)
  - `resume.ts` (buildResumeContentJson/buildResumeAttachmentsJson)
  - `pagination.ts` (parseNonNegativeInteger и related helpers)
  - `lifecycle.ts` (getLifecycleAction)
- `frontend/src/features/vacancies/model/`
  - `useVacanciesPermissions.ts`
  - `useVacanciesQueryState.ts`
  - `useVacancyPipelineActions.ts`
- `frontend/src/pages/VacanciesPage.tsx`
  - orchestration-only + компоновка существующих `...Surface`.

## 5. Стратегия выполнения по этапам

## Этап A. Подготовка и контроль метрик
Задачи:
- Зафиксировать baseline (строки ключевых файлов, список функций для выноса).
- Зафиксировать критерии Done для каждого этапа.

Done:
- Обновлён раздел `Progress log` в этом файле.
- Есть чек-лист на ближайший этап.

## Этап B. ProfilePage refactor
Задачи:
- Вынести утилиты/валидации/ошибки/role helpers в `features/profile/lib`.
- Вынести ролевые формы в `features/profile/ui`.
- Уменьшить `ProfilePage.tsx` до orchestration-композиции.

Done:
- Функционально эквивалентное поведение.
- `eslint` без ошибок.
- Размер `ProfilePage.tsx` существенно ниже baseline.

## Этап C. RegisterPage refactor
Задачи:
- Вынести submit mapping и role animation logic.
- Вынести секции формы.
- Сохранить текущие сценарии ошибок и редирект после регистрации.

Done:
- `eslint` без ошибок.
- Размер `RegisterPage.tsx` существенно ниже baseline.

## Этап D. VacanciesPage refactor
Задачи:
- Вынести error mapping, lifecycle/policy, pagination/resume helpers.
- Вынести action hooks/use-cases из страницы.
- Свести страницу к orchestration и binding UI-компонентов.

Done:
- `eslint` без ошибок.
- Размер `VacanciesPage.tsx` существенно ниже baseline.

## Этап E. Финальная проверка и документация
Задачи:
- Повторно проверить размеры файлов и наличие дублирования.
- Обновить `Progress log` и итоговые метрики.
- Зафиксировать последующие точки улучшения (если нужны).

Done:
- Документ актуален для продолжения работы из нового чата.

## 6. Технические риски и контроль

Риск 1: Поведенческая регрессия при выносе валидаций.
- Контроль: перенос без изменения сигнатур и текстов ошибок; поэтапная проверка.

Риск 2: Нарушение связей между role-specific формами и payload.
- Контроль: выносить сначала чистые функции в `lib`, потом UI.

Риск 3: Разрастание количества мелких файлов без структуры.
- Контроль: строгая группировка только по `lib/model/ui`, без лишней вложенности.

Риск 4: Потеря контекста между чатами.
- Контроль: вести `Progress log` и `Next exact step` после каждого инкремента.

## 7. Правила исполнения шага (операционный стандарт)

Для каждого шага:
1. Выполняем только один логический инкремент.
2. Не трогаем функционал за пределами текущего инкремента.
3. После правок запускаем линтер для затронутой зоны.
4. Обновляем `Progress log` (что сделано, какие файлы, что проверено).
5. Фиксируем `Next exact step` (одна конкретная следующая задача).

## 8. Чек-лист качества для каждого PR/шага

- Нет изменений API-контрактов.
- Нет изменения бизнес-правил.
- Нет `any` в TypeScript (кроме строго обоснованных случаев).
- Нет дублирования логики ролей между компонентами.
- Ролевые проверки централизованы.
- `pages/*` не содержат громоздких helper-функций.
- `eslint` проходит.

## 9. Конкретный порядок работ (минимальные инкременты)

1. Profile: вынести `errors.ts` и подключить обратно.
2. Profile: вынести `roles.ts` и formatters.
3. Profile: вынести `validation.ts`.
4. Profile: вынести `ProfileApplicantSection`.
5. Profile: вынести `ProfileCustomerSection`.
6. Profile: вынести `ProfileExecutorSection`.
7. Profile: вынести common/admin/switcher секции и почистить страницу.
8. Register: вынести `submission.ts`.
9. Register: вынести role selector + customer fields.
10. Register: финальная чистка страницы.
11. Vacancies: вынести `errors.ts`.
12. Vacancies: вынести `policy.ts` + `lifecycle.ts`.
13. Vacancies: вынести `resume.ts` + `pagination.ts`.
14. Vacancies: вынести hooks use-case и финальная чистка страницы.
15. Финальные метрики и update документа.

## 10. Progress log

### 2026-04-11
- Создан файл плана `docs/frontend/frontend-context-optimization-plan.md`.
- Зафиксированы baseline-метрики:
  - `ProfilePage.tsx` — 1492
  - `RegisterPage.tsx` — 592
  - `VacanciesPage.tsx` — 1055
- Зафиксирована целевая стратегия и пошаговая дорожная карта.

## 11. Next exact step

Вынести из `ProfilePage.tsx` функцию обработки API-ошибок в `frontend/src/features/profile/lib/errors.ts` с полным сохранением сообщений и типов, затем подключить её обратно в страницу и прогнать `eslint` по frontend.

## 12. Шаблон продолжения в новом чате

Использовать этот шаблон запроса:

"Продолжаем по `docs/frontend/frontend-context-optimization-plan.md` с шага из раздела `Next exact step`. Сначала выполни только этот шаг, затем обнови `Progress log` и `Next exact step` в документе."
