# Risk Register

Last updated: 2026-03-27

| ID | Risk | Impact | Probability | Status | Mitigation | Next Action |
| --- | --- | --- | --- | --- | --- | --- |
| R-001 | Разрыв между целевой архитектурой (10 сервисов) и текущим состоянием (template backend) | High | High | Mitigating | Принят старт через модульный монолит и поэтапный roadmap `B0-B5` | Проверять границы модулей при каждом подшаге B0-B2 |
| R-002 | Отсутствует инфраструктурный baseline для локальной разработки (БД, брокер, кэш) | High | Medium | Open | Ввести docker-compose на этапе B0 | Подготовить compose-контур после базовой очистки API |
| R-003 | Нет тестового baseline, риск регрессий при росте функционала | High | Medium | Open | Ввести обязательные unit/integration тесты начиная с B0 | Добавить первый integration smoke-test после health endpoint |
| R-004 | Нет зафиксированной стратегии миграций данных | High | Medium | Open | Подключить миграции и регламент их применения в окружениях | Создать migration-ready слой в рамках B0 |

## Status Legend

- `Open`: риск подтвержден, действия не начаты.
- `Mitigating`: действия запущены, риск еще актуален.
- `Accepted`: риск осознанно принят без дополнительных мер.
- `Closed`: риск устранен.
