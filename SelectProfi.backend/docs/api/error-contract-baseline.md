# Error Contract Baseline (B0.8)

Дата фиксации: 2026-03-27

## Цель

Единый формат ошибок для всех API endpoint-ов с предсказуемой структурой для клиентов.

## Формат ответа

- `Content-Type`: `application/problem+json`
- Базовый формат: `ProblemDetails` (RFC 7807) с обязательным прикладным полем `code`

## Обязательные поля

- `type` (`string`)
- `title` (`string`)
- `status` (`number`)
- `detail` (`string`)
- `instance` (`string`)
- `code` (`string`)
- `traceId` (`string`)

## Поле ошибок валидации

Для ошибок валидации дополнительно используется поле:

- `errors` (`array`)

Элемент `errors`:

- `field` (`string`)
- `message` (`string`)
- `code` (`string`)

## Базовые коды ошибок

- `validation_error` -> `400`
- `not_found` -> `404`
- `conflict` -> `409`
- `internal_error` -> `500`

## Пример: ошибка валидации

```json
{
  "type": "https://httpstatuses.com/400",
  "title": "Validation failed",
  "status": 400,
  "detail": "One or more validation errors occurred.",
  "instance": "/api/example",
  "code": "validation_error",
  "traceId": "00-9f6f91c9e8af8843a7f8c2e650cc2c36-3e19c9adf7e3f1c9-00",
  "errors": [
    {
      "field": "email",
      "message": "Email is required.",
      "code": "required"
    }
  ]
}
```

## Пример: внутренняя ошибка

```json
{
  "type": "https://httpstatuses.com/500",
  "title": "Internal server error",
  "status": 500,
  "detail": "An unexpected error occurred.",
  "instance": "/api/example",
  "code": "internal_error",
  "traceId": "00-7f58c4e4a2d542b7b9f1dc8f55ef6ef1-c9dfb4a7efcc1c7a-00"
}
```
