# Health Checks Baseline (B0.9)

Дата фиксации: 2026-03-27

## Назначение endpoint-ов

- `GET /health` — `liveness` (проверка, что API-процесс запущен и отвечает).
- `GET /health/dependencies` — `readiness` (проверка доступности инфраструктурных зависимостей).

## Зависимости в readiness

- `postgres`
- `redis`
- `rabbitmq`

## Интерпретация HTTP-статусов

### `GET /health`

- `200 OK` — приложение живо и принимает HTTP-запросы.

### `GET /health/dependencies`

- `200 OK` — все зависимости в состоянии `Healthy` или `Degraded`.
- `503 Service Unavailable` — минимум одна зависимость в состоянии `Unhealthy`.

## Формат ответа readiness

`application/json` с полями:

- `status` — агрегированный статус (`Healthy`, `Degraded`, `Unhealthy`).
- `totalDurationMs` — суммарное время выполнения проверок.
- `checks[]` — список проверок:
- `name`
- `status`
- `description`
- `durationMs`
- `error`

## Операционное правило

Для диагностики окружения до запуска бизнес-сценариев использовать `GET /health/dependencies`.
Для базового smoke/liveness мониторинга использовать `GET /health`.
