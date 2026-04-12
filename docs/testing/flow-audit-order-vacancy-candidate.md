# Аудит потока Order → Vacancy → Candidate

Дата проверки: 2026-04-13  
Текущий шаг: **Шаг 6/8 — frontend: отображение статуса авто-отправки shortlist (завершён)**

## 1) Что проверяли

Целевой сценарий:
1. Заказчик создаёт заказ и указывает, сколько соискателей хочет получить (минимум 3).
2. Исполнители откликаются на заказ.
3. Заказчик выбирает одного исполнителя.
4. Исполнитель создаёт вакансию.
5. Соискатели откликаются на вакансию или исполнитель добавляет их вручную.
6. Исполнитель выбирает минимальное количество соискателей, система автоматически отправляет их заказчику.
7. Заказчик выбирает одного соискателя и получает контакты.

## 2) Факт по backend/frontend

### Шаг 1. Количество соискателей в заказе (минимум 3)
- Статус: **не реализовано**.
- Backend:
  - В контракте заказа нет поля количества: `backend/Api/Contracts/Orders/CreateOrderRequest.cs`.
  - В доменной модели нет поля: `backend/Domain/Orders/Order.cs`.
  - В result/response/mapping нет поля:  
    `backend/Application/Orders/GetOrderById/GetOrderByIdResult.cs`,  
    `backend/Application/Orders/GetOrders/GetOrdersResult.cs`,  
    `backend/Api/Contracts/Orders/OrderResponse.cs`,  
    `backend/Api/Mappings/OrderRequestMapper.cs`,  
    `backend/Api/Mappings/OrderResponseMapper.cs`.
- Frontend:
  - В формах создания заказа нет поля количества:  
    `frontend/src/features/orders/ui/OrdersCreateSurface.tsx`,  
    `frontend/src/components/workspace/panels/OrderCreatePagePanel.tsx`.
  - В API-типе заказа нет поля: `frontend/src/shared/api/orders/api.ts`.

### Шаг 2. Отклик исполнителя на заказ
- Статус: **реализовано**.
- Backend:
  - `POST /api/orders/{orderId}/respond`: `backend/Api/Controllers/OrdersController.cs`.
  - Бизнес-логика: `backend/Application/Orders/RespondToOrder/RespondToOrderCommandHandler.cs`.
- Frontend:
  - API mutation: `useRespondToOrderMutation` в `frontend/src/shared/api/orders/api.ts`.
  - Используется в workspace:  
    `frontend/src/components/workspace/shell/hooks/useWorkspaceOrderActions.ts`,  
    `frontend/src/components/workspace/panels/OrderDetailsPagePanel.tsx`.

### Шаг 3. Выбор заказчиком одного исполнителя
- Статус: **реализовано**.
- Backend:
  - `POST /api/orders/{orderId}/responses/{executorId}/select`: `backend/Api/Controllers/OrdersController.cs`.
  - В хендлере после выбора ставится `order.ExecutorId`, повторный выбор блокируется (`NotAvailable`):  
    `backend/Application/Orders/SelectOrderResponseExecutor/SelectOrderResponseExecutorCommandHandler.cs`.
- Frontend:
  - API mutation `useSelectOrderResponseExecutorMutation`: `frontend/src/shared/api/orders/api.ts`.
  - UI выбора в workspace: `frontend/src/components/workspace/panels/OrderDetailsPagePanel.tsx`.

### Шаг 4. Создание вакансии исполнителем
- Статус: **реализовано**.
- Backend:
  - `POST /api/vacancies` только для `ExecutorOnly`: `backend/Api/Controllers/VacanciesController.cs`.
  - Разрешено только назначенному исполнителю заказа:  
    `backend/Application/Vacancies/CreateVacancy/CreateVacancyCommandHandler.cs`,  
    `backend/Application/Access/AccessRules.cs` (`VacancyAccessRules.CanCreateVacancy`).
- Frontend:
  - API mutation `useCreateVacancyMutation`: `frontend/src/shared/api/vacancies/api.ts`.
  - Экран: `frontend/src/pages/VacanciesPage.tsx`.

### Шаг 5. Соискатели откликаются или исполнитель добавляет вручную
- Статус: **частично реализовано**.
- Реализовано:
  - Исполнитель вручную добавляет кандидата с резюме:  
    `POST /api/vacancies/{vacancyId}/candidates/resumes` (`ExecutorOnly`) в `backend/Api/Controllers/VacanciesController.cs`.
  - Исполнитель добавляет кандидата из базы:  
    `POST /api/vacancies/{vacancyId}/candidates/{candidateId}` (`ExecutorOnly`) там же.
  - Frontend для этого есть: `frontend/src/features/vacancies/model/useVacancyPipelineActions.ts`.
- Не реализовано:
  - Отдельного backend endpoint, где **соискатель сам откликается на вакансию** в своей роли (`Applicant`) — нет.
  - В workspace-панели соискателя добавление резюме локальное, без API-публикации в vacancy pipeline:  
    `frontend/src/components/workspace/shell/hooks/useWorkspaceCreateActions.ts`,  
    `frontend/src/components/workspace/panels/ApplicantResponseCreatePagePanel.tsx`.

### Шаг 6. Минимум кандидатов и авто-отправка заказчику
- Статус: **не реализовано**.
- Нет источника минимального количества кандидатов (из заказа).
- Нет правила/триггера "достигнут минимум → автоматически отправить заказчику".
- Текущая модель — просто стадии `Pool/Shortlist`, без понятия "пакет отправки":
  - `backend/Domain/Candidates/VacancyCandidateStage.cs`
  - `backend/Application/Candidates/UpdateVacancyCandidateStage/UpdateVacancyCandidateStageCommandHandler.cs`
  - `backend/Application/Candidates/GetVacancyCandidates/GetVacancyCandidatesQueryHandler.cs`

### Шаг 7. Заказчик выбирает одного кандидата и получает контакты
- Статус: **реализовано**.
- Backend:
  - Выбор кандидата заказчиком:  
    `PATCH /api/vacancies/{vacancyId}/selected-candidate`,  
    `backend/Application/Candidates/SelectVacancyCandidate/SelectVacancyCandidateCommandHandler.cs`.
  - Выдача контактов выбранного:  
    `GET /api/vacancies/{vacancyId}/selected-candidate/contacts`,  
    `backend/Application/Candidates/GetSelectedCandidateContacts/GetSelectedCandidateContactsQueryHandler.cs`.
- Frontend:
  - `useSelectVacancyCandidateMutation`, `useLazyGetSelectedCandidateContactsQuery`:  
    `frontend/src/shared/api/candidates/api.ts`.
  - Экшен-слой: `frontend/src/features/vacancies/model/useVacancyContactsActions.ts`.

## 3) Что реально запустили

### Backend tests
- Команда: `dotnet test backend/backend.sln --nologo`
- Результат: **не прошли** (32 failed / 37 total).
- Причина: инфраструктурная, не логика фичи — `Npgsql.PostgresException: 28P01 password authentication failed for user "postgres"` (миграции на старте тестового host).

### Frontend lint
- Команда: `npm run lint` (в `frontend`)
- Результат: **OK**.

### Frontend build
- Команда: `npm run build` (в `frontend`)
- Результат: **не прошёл** из-за текущих TS-ошибок в существующем коде (вне проверяемого потока), например:
  - `src/features/auth/lib/registration/role-animation.ts` (missing export `RegistrationRole`)
  - `src/pages/ProfilePage.tsx` (type mismatch)
  - `src/shared/api/orders/api.ts` (tag typing).

## 4) Чего не хватает и где делать

### A. Обязательное поле "требуемое количество соискателей" (>= 3)
- Backend:
  - Добавить поле в `Order` + миграция.
  - Протянуть через request/command/result/response/mappers.
  - Валидация: минимум 3.
- Frontend:
  - Добавить поле в формы создания заказа (`OrdersCreateSurface`, `OrderCreatePagePanel`).
  - Добавить в API-тип `CreateOrderRequest` + отображение в деталях/таблицах.

### B. Реальный отклик соискателя на вакансию
- Backend:
  - Отдельный endpoint для `Applicant` (например, `POST /api/vacancies/{vacancyId}/respond`), который создаёт/привязывает кандидата в pipeline.
- Frontend:
  - Подключить panel соискателя к API вместо локального mock-поведения.

### C. Автоматическая отправка shortlist заказчику при достижении минимума
- Backend:
  - Явная модель "submitted-to-customer" (например, timestamp/version/batch).
  - Доменное правило при смене стадии в `Shortlist`: если count(shortlist) >= requiredCandidatesCount, ставить флаг/событие отправки.
- Frontend:
  - Индикация, что shortlist отправлен автоматически.
  - Блок/состояние для заказчика "доступно к выбору".

### D. Автотесты под новый поток
- Backend integration:
  - Новый тест-класс для полного e2e HTTP сценария заказа и pipeline с required count.
- Frontend e2e (Playwright):
  - Сценарий от 3 ролей: Customer → Executor → Applicant/Executor pool → Customer selection.

## 5) Рекомендуемая последовательность минимальных шагов

1. Добавить `requiredCandidatesCount` в backend контракты/модель заказа + миграция + валидация `>=3`.
2. Протянуть поле в frontend типы/API и формы создания заказа.
3. Добавить backend endpoint отклика соискателя на вакансию.
4. Подключить Applicant UI к реальному endpoint (убрать локальную имитацию).
5. Реализовать backend правило авто-отправки shortlist при достижении минимума.
6. Добавить frontend индикацию статуса отправки shortlist.
7. Написать backend integration-тест полного сценария.
8. Написать frontend Playwright e2e (минимум happy-path + 1 негативный кейс по минимуму).

## 6) Прогресс по шагам

- Шаг 1/8: аудит и фиксация разрывов — завершён.
- Шаг 2/8: backend `requiredCandidatesCount` + минимум через `OrderCandidateRequirements:MinRequestedCandidatesCount` — завершён.
- Шаг 3/8: frontend формы заказа + API-тип `requestedCandidatesCount` + client guard `>=3` — завершён.
- Шаг 4/8: backend endpoint отклика соискателя (`POST /api/vacancies/{vacancyId}/respond`) — завершён.
- Шаг 5/8: backend-правило фиксации авто-отправки shortlist (`ShortlistSentToCustomerAtUtc`) при достижении порога заказа — завершён.
- Шаг 6/8: frontend-отображение статуса авто-отправки shortlist в Vacancy list/details — завершён.
- Следующий шаг: **Шаг 7/8 — backend integration-тест полного сценария с minimum shortlist.**

## 7) Промпт для продолжения в новом чате

```text
Продолжаем по файлу docs/testing/flow-audit-order-vacancy-candidate.md.
Выполни только Шаг 7/8:
- backend integration: добавь тест полного сценария,
  заказ с requestedCandidatesCount=3 -> публикация вакансии -> добавление/перевод кандидатов в shortlist -> проверка, что `ShortlistSentToCustomerAtUtc` выставляется при достижении порога;
- учти негативный кейс: при shortlist < requestedCandidatesCount поле не выставлено;
- не трогай frontend;
- после изменений запусти сборку backend и зафиксируй результат.
Работаем строго одним завершённым шагом.
```
