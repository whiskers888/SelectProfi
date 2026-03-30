
# SelectProfi

Монорепозиторий сервиса SelectProfi:
- `backend` — ASP.NET Core API (`.NET 10`, EF Core, PostgreSQL, Redis, RabbitMQ).
- `frontend` — React + Vite + TypeScript (RTK Query, Tailwind, Shadcn UI).

## Требования

- .NET SDK 10
- Node.js 22+ и npm
- Docker Desktop (для PostgreSQL/Redis/RabbitMQ)

## Быстрый старт (локальная разработка)

### 1. Поднять инфраструктуру

```powershell
cd Z:\SelectProfi
docker compose up -d postgres redis rabbitmq
```

### 2. Запустить backend

```powershell
cd Z:\SelectProfi\backend
dotnet restore .\backend.sln
dotnet run --project .\Api
```

API по умолчанию: `http://localhost:5268`  
OpenAPI (Development): `http://localhost:5268/openapi/v1.json`

### 3. Запустить frontend

```powershell
cd Z:\SelectProfi\frontend
npm install
$env:VITE_API_BASE_URL="http://localhost:5268"
npm run dev
```

Frontend по умолчанию: `http://localhost:5173`

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
docker compose up --build
```

Контейнер backend публикуется на `http://localhost:5268`.
