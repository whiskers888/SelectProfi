# Layer Dependency Rules (B0.6 Baseline)

Дата фиксации: 2026-03-27
Дата обновления: 2026-03-30

## Слои

- `API`
- `Application`
- `Domain`
- `Infrastructure`

## Разрешенные зависимости

- `Domain` -> нет ссылок на другие слои.
- `Application` -> может ссылаться только на `Domain`.
- `Infrastructure` -> может ссылаться на `Application` и `Domain`.
- `API` -> может ссылаться на `Application` и `Infrastructure`.

## Запрещенные зависимости

- `Domain` -> `Application`, `Infrastructure`, `API`.
- `Application` -> `Infrastructure`, `API`.
- `Infrastructure` -> `API`.

## Правила границ

- Контракты команд/запросов и их обработчики размещаются в `Application`.
- Бизнес-правила и доменные модели размещаются в `Domain`.
- Реализации доступа к данным и внешним системам размещаются в `Infrastructure`.
- HTTP endpoints, transport-модели и composition root размещаются в `API`.

## Baseline размещения технических компонентов (2026-03-30)

- `API`: `Controllers`, `Contracts`, `Middlewares`, transport authentication handler (`Authentication/SimpleJwtAuthenticationHandler`), composition root (`Program.cs`).
- `Infrastructure`: `Data` + `Migrations`, реализации dependency health checks, security-реализации (password hashing, token factory/adapters), инфраструктурные options (`JwtOptions`).
- `Application`: прикладные контракты и оркестрация сценариев в формате CQRS `Command/Query + Handler`.
- `Domain`: доменные сущности, value objects, инварианты и бизнес-правила без зависимостей на внешние слои.

## Операционные оговорки

- EF Core миграции собираются из `Infrastructure` (`MigrationsAssembly = "Infrastructure"`).
- Endpoint-ы `GET /health` и `GET /health/dependencies` остаются в `API`, но проверки внешних зависимостей реализуются в `Infrastructure`.

## CQRS статус (2026-03-30)

- Контроллеры `Profile` и `Auth` вызывают application-слой через `IQueryDispatcher`/`ICommandDispatcher`.
- Прямые зависимости контроллеров от legacy application-сервисов удалены.
- Базовые сценарии `auth` (`register/login/refresh`) и `profile` (`get/update`) работают через `Command/Query handlers`.

## Правило развития

При добавлении нового проекта или ссылки в solution изменение считается корректным только если оно не нарушает правила выше.
