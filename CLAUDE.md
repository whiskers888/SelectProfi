# SelectProfi — CLAUDE.md

## Стек

- **Backend**: .NET (C#), Clean Architecture: `backend/Domain`, `backend/Application`, `backend/Infrastructure`, `backend/Api`.
- **Frontend**: React 19 + TypeScript, Vite, Redux Toolkit + RTK Query (codegen из OpenAPI), Tailwind CSS 3, Radix UI, class-variance-authority, Tiptap (rich text).
- **Тесты**: Vitest + Testing Library (frontend), xUnit-стиль IntegrationTests (backend, `backend/IntegrationTests`).

## Backend: границы слоёв

Зависимости только внутрь: `Api → Application → Domain`, `Infrastructure → Application` (через интерфейсы, Dependency Inversion).

- `Domain` не зависит ни от чего выше — только сущности и бизнес-инварианты.
- `Application` не знает про `Infrastructure` и `Api` — только интерфейсы persistence (`I<Feature>Persistence`).
- `Infrastructure` реализует интерфейсы `Application` (EF Core, внешние сервисы).
- `Api` — контроллеры, маппинг ошибок (`Api/Errors`), DI-регистрация.

## Backend: конвенции

CQRS naming, слои, маппинг ошибок → HTTP, чек-лист нового endpoint — в скилле `.claude/skills/selectprofi-backend/SKILL.md`. Загружать перед правкой backend-кода. Эталон структуры: `backend/Application/Vacancies/CreateVacancy/*`.

## Инварианты (общие для frontend и backend)

- Shortlist только из Pool той же вакансии.
- selectedCandidateId — только из Shortlist той же вакансии; один на вакансию.
- Контакты: первый привязавший рекрутер — 180 дней; Customer — после финального выбора; остальным — нет.
- Без права на контакты — алиас «Прилагательное + Специализация» вместо ФИО.
- Стадии MVP — только Pool и Shortlist.

## Frontend: дизайн-токены — ЕДИНСТВЕННЫЙ источник цвета

- Правда в `frontend/src/design/tokens.json` (hex, light/dark темы).
- `npm run tokens:build` генерит `frontend/src/design/tokens.css` (HSL-тройки под CSS-переменные).
- Tailwind (`tailwind.config.cjs`) мапит классы на переменные: `bg-primary` → `hsl(var(--primary))` и т.д.
- **Правило**: никогда не хардкодить `slate-*`, `gray-*`, `blue-*` и т.п. в компонентах `components/ui/*`. Только токен-классы (`bg-card`, `text-muted-foreground`, `border-border`, `bg-success-muted` …). Хардкод рвёт тёмную тему.
- Опорный документ правил UI/UX: `docs/system-design-ui-ux.md` (WCAG 2.2 AA обязателен, light+dark обязательны для новых компонентов).

## Frontend: структура

- `components/ui/*` — примитивы дизайн-системы (Radix + CVA), без бизнес-логики.
- `features/<domain>/ui|model|lib` — фичи (orders, vacancies, profile, auth, dashboard).
- `pages/*` — страницы-контейнеры, собирают features.
- `shared/api/*` — RTK Query слайсы, генерятся через `npm run api:generate` из OpenAPI backend-а — **типы руками не писать**, перегенерировать после смены контракта backend.

## Платформа

- Mobile = адаптив на вебе (responsive Tailwind-классы), отдельного native/PWA пока нет. PWA — будущий план, не текущий скоуп.
- При добавлении layout — проверять на `sm:`/`md:` breakpoints, не оставлять фикс-ширину без адаптации.

## Команды

```
npm run dev            # frontend dev (пересобирает токены перед стартом)
npm run build           # tsc + vite build
npm run lint             # eslint
npm run test:run       # vitest
npm run tokens:build   # пересборка CSS-переменных из tokens.json
npm run api:generate    # regen RTK Query типов из OpenAPI
dotnet test              # backend IntegrationTests (из backend/)
```

## Документация

- `docs/system-design-ui-ux.md` — UX-стандарт (палитра, WCAG, темы).
- `docs/ui-mapping.md`, `docs/pages/*.html` — референс-мокапы экранов.
- `docs/frontend-api-contracts.md`, `docs/testing/*` — фактическая реализация API/флоу; `docs/pages/*.html` — только превью, не принимать за реализованное.
- Статус задач, ADR, риски — во внешнем трекере (YouGile), не дублировать в репо.

## Инструменты агента

Приоритет при конфликте: этот файл и docs/ > скиллы > стиль по умолчанию.

- Код: всегда применять `kill-slop`. Слои Api/Application/Domain/Infrastructure — существующая архитектура, не «выдуманные слои»; запрет kill-slop касается только новых слоёв и абстракций на один случай.
- Backend: перед правкой загрузить скилл `selectprofi-backend`.
- Frontend: `components-hierarchy` и `pedantic-react`. Цвета — только токены из docs/system-design-ui-ux.md, даже если скилл предлагает литералы Tailwind. Данные — RTK Query, не TanStack Query. Классы — через `cn()` (clsx + tailwind-merge) из `@/lib/utils`, не локальная `classNames`-утилита. Иконки — `lucide-react`, не FontAwesome. Структура — `components/ui` + `features/<domain>` + `pages`, не atoms/molecules/organisms.
- Перед PR: `/security-review` по диффу (особенно доступ к контактам и выбор кандидата), затем `/pr-hygiene`.
- QRSPI: полный маршрут — новые фичи потока Order→Vacancy→Pool→Shortlist; quick fix — баги; вопросы и мелкие правки — без QRSPI. Research читает docs/frontend-api-contracts.md и docs/testing/*, не docs/pages/*.html.
- Caveman: только для ответов в чате. PR-описания, docs/ и комментарии в коде — полным языком.
