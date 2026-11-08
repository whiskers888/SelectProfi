---
name: selectprofi-backend
description: Use when adding or changing backend code in SelectProfi (ASP.NET Core, .NET 10, EF Core) — endpoints, commands/queries, entities, migrations, integration tests.
---

# SelectProfi backend

## Слои (существующие, не выдумывать новые)
- Api — контроллеры, маппинг в problem+json. Без бизнес-логики.
- Application — команды/запросы (CQRS), валидация, проверка прав.
- Domain — сущности и инварианты. Не зависит от EF и ASP.NET.
- Infrastructure — EF Core, PostgreSQL, Redis, RabbitMQ.

## Именование (CQRS, Application/Cqrs)

Паттерн строгий, копировать 1:1 на новые фичи:

- Команда: `<Verb><Entity>Command : ICommand<TResult>` в папке `Application/<Feature>/<Verb><Entity>/`.
- Обработчик: `<Verb><Entity>CommandHandler : ICommandHandler<TCommand, TResult>`.
- Результат: `<Verb><Entity>Result` (record с `ErrorCode` полем, не exception для доменных ошибок).
- Код ошибки: `<Verb><Entity>ErrorCode` (enum).
- Контракт persistence: `I<Verb><Entity>Persistence` (интерфейс, реализация в Infrastructure).
- Запросы: то же самое, но `IQuery<TResult>` / `IQueryHandler` / `...Query` вместо Command.
- Диспатч через `ICommandDispatcher` / `IQueryDispatcher` (регистрация в DI, без MediatR).

Пример-эталон: `backend/Application/Vacancies/CreateVacancy/*`.

## Ошибки → HTTP

- `Api/Errors/<Feature>ProblemMap.cs` — маппинг `ErrorCode → ApiProblemDescriptor (Status, Title, Code, Detail)`.
- `Api/Errors/<Feature>ActionResultExtensions.cs` — метод `ToActionResult` конвертит `Result` в `IActionResult` через `ControllerProblemExtensions.ToProblem`.
- Формат ответа — RFC7807 `application/problem+json`, с полем `code` и `traceId`.

## Инварианты — проверять в Domain/Application, не в контроллере
- Shortlist только из Pool той же вакансии.
- selectedCandidateId — только из Shortlist той же вакансии; один на вакансию.
- Контакты: первый привязавший рекрутер — 180 дней; Customer — после финального выбора; остальным — нет.
- Без права на контакты — алиас «Прилагательное + Специализация» вместо ФИО.
- Стадии MVP — только Pool и Shortlist.

## Новый endpoint — чек-лист
- [ ] Ошибки — application/problem+json.
- [ ] Виден в GET /openapi/v1.json.
- [ ] Integration-тест: happy path.
- [ ] Integration-тест: 403 для каждой непринадлежащей роли.
- [ ] Контракт обновлён в docs/backend/api/<домен>.
- [ ] Отмечено, вызывает ли его frontend (docs/frontend-api-contracts.md).
