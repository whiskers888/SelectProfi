# Vacancy CRUD MVP Contract (PRI-74)

Дата фиксации: 2026-04-01
Статус: baseline для реализации `B2.1 Vacancy CRUD (MVP)`

## 1. Канонический термин

- Для API, OpenAPI, DTO и handler naming используется термин `vacancy`.
- Канонический ресурс: `/api/vacancies`.
- Канонический идентификатор: `vacancyId`.
- Термин `order` используется как upstream-сущность источника требований, но не как ресурс текущего контракта.

## 2. Бизнес-поток (целевая модель)

1. `Customer` создает `Order` с требованиями.
2. Несколько `Executor` откликаются на заказ.
3. `Customer` выбирает одного `Executor`.
4. Выбранный `Executor` создает `Vacancy` на базе требований `Order`.
5. По этой `Vacancy` исполнитель ведет pipeline кандидатов и отправляет shortlist заказчику.

Правило модели:

- Исходные требования заказчика хранятся в `Order` и не перезаписываются при создании `Vacancy`.
- `Vacancy` — отдельная сущность, связанная с заказом через `orderId`.

## 3. Scope PRI-74

Входит:

- CRUD вакансии.
- `soft delete` вакансии.
- Контроль доступа на уровне ролей и привязки к заказу/исполнителю.

Не входит:

- Статусы вакансии и история переходов (`PRI-75`).
- Создание/обработка откликов (`PRI-76`, `PRI-77`).
- Пайплайн кандидатов (резюме, встречи, ответы на вопросы, shortlist).
- Событийная интеграция через RabbitMQ.
- Полная реализация `Order`-модуля и выбора исполнителя (используется как внешний precondition).

## 4. RBAC baseline

- `Executor` (назначенный на `orderId`):
  - может `POST`, `PATCH`, `DELETE` свою вакансию по этому заказу;
  - может `GET` свою вакансию.
- `Customer` (владелец `orderId`):
  - может `GET` вакансии по своим заказам;
  - не может `POST`, `PATCH`, `DELETE` в рамках `PRI-74`.
- `Admin`:
  - может `GET` любые вакансии;
  - операции `POST`, `PATCH`, `DELETE` в рамках `PRI-74` не выполняет.
- `Applicant`, `Executor` (не назначенный):
  - доступ к vacancy CRUD отсутствует.

## 5. Модель данных вакансии (MVP)

Обязательные поля:

- `id: guid`
- `orderId: guid`
- `customerId: guid`
- `executorId: guid`
- `title: string` (1..200)
- `description: string` (1..4000)
- `createdAtUtc: datetime`
- `updatedAtUtc: datetime`
- `deletedAtUtc: datetime | null`

Правила:

- Одна активная (`deletedAtUtc is null`) вакансия на один `orderId`.
- Удаление только логическое: заполняется `deletedAtUtc`.
- Записи с `deletedAtUtc != null` не возвращаются в `GET`-endpoint-ах.

## 6. Endpoint-и

## 6.1 `POST /api/vacancies`

Назначение: создать вакансию по заказу.

Доступ:

- `Executor`, назначенный на `orderId`.

Request body:

```json
{
  "orderId": "00000000-0000-0000-0000-000000000001",
  "title": "Senior Frontend Developer",
  "description": "React/TypeScript, B2B SaaS."
}
```

Responses:

- `201 Created` + тело вакансии.
- `400 Bad Request` (валидация).
- `401 Unauthorized`.
- `403 Forbidden` (нет назначения на заказ).
- `404 Not Found` (`orderId` не найден).
- `409 Conflict` (для `orderId` уже есть активная вакансия).

## 6.2 `GET /api/vacancies/{vacancyId}`

Назначение: получить детальную карточку вакансии.

Доступ:

- `Executor` (назначенный на вакансию), `Customer` (владелец заказа), `Admin`.

Responses:

- `200 OK` + тело вакансии.
- `401 Unauthorized`.
- `403 Forbidden`.
- `404 Not Found`.

## 6.3 `GET /api/vacancies`

Назначение: получить список вакансий.

Доступ:

- `Executor` (только назначенные ему вакансии), `Customer` (вакансии его заказов), `Admin` (все).

Query params (MVP):

- `limit` (optional, default `20`, max `100`)
- `offset` (optional, default `0`)

Responses:

- `200 OK` + список вакансий.
- `401 Unauthorized`.
- `403 Forbidden`.

## 6.4 `PATCH /api/vacancies/{vacancyId}`

Назначение: обновить вакансию.

Доступ:

- `Executor`, назначенный на вакансию.

Request body:

```json
{
  "title": "Senior Frontend Engineer",
  "description": "React/TypeScript, product team."
}
```

Responses:

- `200 OK` + обновленная вакансия.
- `400 Bad Request`.
- `401 Unauthorized`.
- `403 Forbidden`.
- `404 Not Found`.

## 6.5 `DELETE /api/vacancies/{vacancyId}`

Назначение: выполнить `soft delete` вакансии.

Доступ:

- `Executor`, назначенный на вакансию.

Responses:

- `204 No Content`.
- `401 Unauthorized`.
- `403 Forbidden`.
- `404 Not Found`.

## 7. Error contract

- Используется единый `application/problem+json`.
- Базовый формат и коды ошибок — по `docs/backend/api/error-contract-baseline.md`.

## 8. Требования к реализации

- Endpoint-ы, DTO и схемы должны появиться в `GET /openapi/v1.json`.
- Для `PRI-74` обязательны integration tests на:
  - create/get/list/update/soft-delete happy-path для назначенного `Executor`;
  - запрет CUD для `Customer`, `Applicant` и неназначенного `Executor`;
  - доступ `Customer` только на чтение;
  - недоступность soft-deleted записи через `GET`.
