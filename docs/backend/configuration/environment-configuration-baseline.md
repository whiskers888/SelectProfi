# Environment Configuration Baseline (B0.7)

Дата фиксации: 2026-03-27

## Окружения

- `Development`
- `Staging`
- `Production`

## Обязательные параметры

- `ConnectionStrings:Postgres`

## Источники конфигурации и приоритет

Порядок загрузки и переопределения:

1. `appsettings.json`
2. `appsettings.{Environment}.json`
3. Переменные окружения

Ключ переменной окружения для PostgreSQL:

- `ConnectionStrings__Postgres`

## Правила хранения секретов

- `Development`: локально через user secrets или переменные окружения.
- `Staging` и `Production`: только переменные окружения/секрет-хранилище, без хранения секретов в `appsettings.*.json`.

## Правило запуска

Приложение должно стартовать только при непустом `ConnectionStrings:Postgres`.

## Команды проверки запуска

### Staging (PowerShell)

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Staging"
$env:ConnectionStrings__Postgres = "Host=localhost;Port=5432;Database=selectprofi;Username=postgres;Password=postgres"
dotnet run --no-launch-profile --project .\SelectProfi.backend\SelectProfi.backend.csproj --urls http://127.0.0.1:5191
```

```powershell
Invoke-WebRequest http://127.0.0.1:5191/health
```

### Staging (bash)

```bash
ASPNETCORE_ENVIRONMENT=Staging \
ConnectionStrings__Postgres='Host=localhost;Port=5432;Database=selectprofi;Username=postgres;Password=postgres' \
dotnet run --no-launch-profile --project ./SelectProfi.backend/SelectProfi.backend.csproj --urls http://127.0.0.1:5191
```

```bash
curl -i http://127.0.0.1:5191/health
```

### Production (PowerShell)

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Production"
$env:ConnectionStrings__Postgres = "Host=localhost;Port=5432;Database=selectprofi;Username=postgres;Password=postgres"
dotnet run --no-launch-profile --project .\SelectProfi.backend\SelectProfi.backend.csproj --urls http://127.0.0.1:5192
```

```powershell
Invoke-WebRequest http://127.0.0.1:5192/health
```

### Production (bash)

```bash
ASPNETCORE_ENVIRONMENT=Production \
ConnectionStrings__Postgres='Host=localhost;Port=5432;Database=selectprofi;Username=postgres;Password=postgres' \
dotnet run --no-launch-profile --project ./SelectProfi.backend/SelectProfi.backend.csproj --urls http://127.0.0.1:5192
```

```bash
curl -i http://127.0.0.1:5192/health
```
