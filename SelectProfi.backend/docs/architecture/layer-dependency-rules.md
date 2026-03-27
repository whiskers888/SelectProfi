# Layer Dependency Rules (B0.6 Baseline)

Дата фиксации: 2026-03-27

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

- Контракты use-case размещаются в `Application`.
- Бизнес-правила и доменные модели размещаются в `Domain`.
- Реализации доступа к данным и внешним системам размещаются в `Infrastructure`.
- HTTP endpoints, transport-модели и composition root размещаются в `API`.

## Правило развития

При добавлении нового проекта или ссылки в solution изменение считается корректным только если оно не нарушает правила выше.
