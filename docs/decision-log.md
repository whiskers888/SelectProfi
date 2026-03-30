# Decision Log

Last updated: 2026-03-30

## ADR-001: Старт через модульный монолит

- Date: 2026-03-27
- Status: Accepted
- Context: Репозиторий находится в начальном состоянии backend-template, при этом целевая архитектура включает 10 доменных сервисов.
- Decision: Реализация начинается как модульный монолит с жесткими границами доменов и контрактами, с последующим выделением в микросервисы по мере зрелости.
- Consequences: Ускорение старта, ниже стоимость изменений на ранней фазе, требуется дисциплина по границам модулей.

## ADR-002: Пошаговый roadmap `B0-B5`

- Date: 2026-03-27
- Status: Accepted
- Context: Изначальный план был слишком крупным и не давал проверяемых промежуточных результатов.
- Decision: Backend разделен на этапы `B0-B5` с критериями готовности, frontend синхронизируется после стабилизации backend-контрактов `B1-B2`.
- Consequences: Повышается управляемость и прозрачность прогресса, упрощается контроль рисков и качества.

## ADR-003: Технические реализации вынесены из `API` в `Infrastructure`

- Date: 2026-03-30
- Status: Accepted
- Context: В `API` были размещены инфраструктурные компоненты (`Migrations`, `HealthChecks`, security-реализации), что размывало границы transport/composition слоя и усложняло подготовку к переходу на CQRS.
- Decision: Перенести инфраструктурные компоненты в `Infrastructure` и зафиксировать разделение ответственности:
  - EF Core migrations и snapshot в `Infrastructure/Data/Migrations`, `MigrationsAssembly = "Infrastructure"`.
  - Реализации dependency health checks в `Infrastructure/HealthChecks`.
  - Security-реализации (hashing/token factory/adapters) в `Infrastructure/Security`.
  - В `API` оставить только transport-компоненты, включая `Authentication/SimpleJwtAuthenticationHandler`, контроллеры, контракты и composition root.
- Consequences: Границы слоёв стали согласованы с архитектурными правилами, снижена сцепка `API` с инфраструктурными деталями, подготовлен устойчивый baseline для поэтапной миграции сценариев на CQRS.

## ADR-004: Базовые сценарии `Auth` и `Profile` переведены на CQRS dispatch

- Date: 2026-03-30
- Status: Accepted
- Context: До миграции контроллеры напрямую зависели от отдельных интерфейсов application-слоя, что затрудняло унификацию под CQRS и усложняло дальнейшее масштабирование сценариев.
- Decision: Для базовых сценариев `auth` (`register/login/refresh`) и `profile` (`get/update`) внедрить единый вызов application-слоя через `ICommandDispatcher` / `IQueryDispatcher` и `Command/Query handlers`; прямые зависимости контроллеров от legacy application-сервисов удалить.
- Consequences: Вызовы application-логики унифицированы, слой контроллеров упрощен, дальнейшее расширение CQRS (pipeline-behaviors, cross-cutting policies, новые handlers) можно делать без повторного рефакторинга endpoint-ов.
