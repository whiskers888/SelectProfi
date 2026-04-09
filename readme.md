# SelectProfi


Монорепозиторий сервиса SelectProfi.

- `backend` — ASP.NET Core API (`.NET 10`, EF Core, PostgreSQL, Redis, RabbitMQ).
- `frontend` — React + Vite + TypeScript (RTK Query, Tailwind, Radix UI).
- `docker-compose.yml` — локальный контур backend + frontend + инфраструктура.

## Структура

- `backend/` — API, application/domain/infrastructure слои, интеграционные тесты.
- `frontend/` — UI-приложение, feature-модули, shared API layer.
- `docs/` — проектная документация и UI-материалы.

## Требования

### Для запуска через Docker (рекомендуется)

- Docker Desktop / Docker Engine с Compose.

### Для локального запуска без контейнера frontend

- .NET SDK `10.0`
- Node.js `22+` и npm

## Быстрый старт (Docker Compose)

1. Создайте `.env` из шаблона:

```bash
cp .env.example .env
```

2. Поднимите стек:

```bash
docker compose up --build
```

3. Сервисы:

- Backend: `http://localhost:5268`
- Frontend: `http://localhost:5173`
- OpenAPI: `http://localhost:5268/openapi/v1.json`

В `Development` backend автоматически:

- применяет EF Core миграции;
- создаёт тестовые аккаунты:
  - `executor@selectprofi.local` / `1`
  - `customer@selectprofi.local` / `1`

## Локальный запуск (frontend вне Docker)

1. Поднимите backend + инфраструктуру:

```bash
docker compose up -d app postgres redis rabbitmq
```

2. Запустите frontend:

```bash
cd frontend
npm ci
npm run dev:server
```

Альтернатива без backend:

```bash
cd frontend
npm ci
npm run dev:mock
```

## Frontend: режимы API

Управляется переменной `VITE_API_MODE`:

- `server` — запросы идут в backend (через Vite proxy).
- `mock` — in-memory API внутри frontend.

Файлы:

- `frontend/.env.server`
- `frontend/.env.mock`
- `frontend/.env.example`

## Полезные команды

### Frontend

```bash
cd frontend
npm run lint
npm run test:run
npm run build
```

### Backend

```bash
cd backend
dotnet build backend.sln
dotnet test backend.sln
```

## Переменные окружения

Корневой `.env`:

- `COMPOSE_PROJECT_NAME` — имя compose-проекта.
- `BACKEND_PORT` — внешний порт backend (по умолчанию `5268`).
- `FRONTEND_PORT` — внешний порт frontend (по умолчанию `5173`).
- `POSTGRES_PASSWORD` — пароль PostgreSQL.

## Документация

- Общая: `docs/`
- API-контракты frontend: `docs/frontend-api-contracts.md`
- UI/UX baseline: `docs/system-design-ui-ux.md`
