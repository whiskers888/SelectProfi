
# SelectProfi

Монорепозиторий сервиса SelectProfi:
- `backend` — ASP.NET Core API (`.NET 10`, EF Core, PostgreSQL, Redis, RabbitMQ).
- `frontend` — React + Vite + TypeScript (RTK Query, Tailwind, Shadcn UI).

## Требования

- .NET SDK 10
- Node.js 22+ и npm
- Docker Desktop (для PostgreSQL/Redis/RabbitMQ)

## Быстрый старт (локальная разработка)

### 1. Запуск всего стека одной командой (backend + frontend + infra)

```powershell
cd Z:\SelectProfi
copy .env.example .env
docker compose up --build
```

После старта:
- Backend: `http://localhost:5268`
- Frontend: `http://localhost:5173`
- OpenAPI: `http://localhost:5268/openapi/v1.json`

В development backend автоматически:
- применяет EF Core миграции;
- создаёт тестовые учётки:
  - `executor@selectprofi.local` / `1`
  - `customer@selectprofi.local` / `1`

### 2. Локальный запуск без Docker frontend (опционально)

```powershell
cd Z:\SelectProfi
docker compose up -d postgres redis rabbitmq app
```

```powershell
cd Z:\SelectProfi\frontend
npm install
npm run dev
```

Vite dev proxy уже настроен на backend (`/api`, `/health`, `/openapi`), поэтому `VITE_API_BASE_URL` по умолчанию можно не задавать.

### 2.1. Режимы запуска frontend: mock или server

Frontend поддерживает 2 режима API:
- `server` — запросы идут в backend (через Vite proxy).
- `mock` — in-memory mock API внутри frontend, backend не нужен.

```powershell
cd Z:\SelectProfi\frontend
npm run dev:server
```

```powershell
cd Z:\SelectProfi\frontend
npm run dev:mock
```

Также можно использовать `frontend/.env.example` и задать `VITE_API_MODE` вручную.

### 3. Как избежать конфликтов портов

Порты и имя compose-проекта вынесены в `.env`:
- `COMPOSE_PROJECT_NAME`
- `BACKEND_PORT`
- `FRONTEND_PORT`
- `POSTGRES_PASSWORD`

## Полезные команды

### Frontend

```powershell
cd Z:\SelectProfi\frontend
npm run lint
npm run test:run
npm run build
```

### Backend

```powershell
cd Z:\SelectProfi\backend
dotnet build .\backend.sln
dotnet test .\backend.sln
```

## Backend CQRS (текущий baseline)

- Контроллеры вызывают application-логику через `ICommandDispatcher` / `IQueryDispatcher`.
- `Command/Query` и их `Handler` размещаются в `backend/Application` по доменным папкам (`Auth`, `Profile` и т.д.).
- Для нового сценария:
  - создать `Command` или `Query` + `Result`;
  - добавить `ICommandHandler<,>` или `IQueryHandler<,>`;
  - зарегистрировать handler в `backend/Application/DependencyInjection.cs`;
  - вызвать из контроллера через dispatcher.

## Запуск backend в Docker (вместе с инфраструктурой)

```powershell
cd Z:\SelectProfi
docker compose up --build app postgres redis rabbitmq
```

Контейнер backend публикуется на `http://localhost:5268`.
