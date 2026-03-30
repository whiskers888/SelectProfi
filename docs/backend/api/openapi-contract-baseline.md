# OpenAPI Contract Baseline (B0.10)

Дата фиксации: 2026-03-27

## Источник контракта

- Контракт генерируется рантаймом ASP.NET Core через `AddOpenApi` и `MapOpenApi`.
- Точка доступа к документу: `GET /openapi/v1.json`.
- Документ публикуется в окружении `Development`.

## Зафиксированный baseline текущего контракта

- `/health`:
- `GET` -> `200 OK`
- `/health/dependencies`:
- `GET` -> `200 OK` или `503 Service Unavailable`

## Обязательное правило обновления контракта

При любом изменении публичного API (новый endpoint, изменение route/method, схемы запроса/ответа, кодов статусов) обязательно:

1. Обновить OpenAPI-описание в коде.
2. Обновить baseline-документ `docs/api/openapi-contract-baseline.md`.
3. Обновить или добавить интеграционные проверки контракта.
4. Проверить, что `GET /openapi/v1.json` отражает изменения до merge.

## Текущая автоматическая проверка

- `SelectProfi.backend.IntegrationTests/HealthSmokeTests.cs`
- Тест: `OpenApiDocument_ContainsHealthEndpoint`
