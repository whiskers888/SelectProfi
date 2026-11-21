# Продолжение работы с ноутбука

## Рекомендуемый вариант: GitHub

Репозиторий подключён к `origin` (`https://github.com/whiskers888/SelectProfi.git`) и имеет публичную видимость. Текущая рабочая ветка — `feature/night-shift-refactor`. Любой push в этот репозиторий делает новые коммиты доступными всем.

После коммита на основном компьютере отправьте ветку:

```powershell
git push -u origin feature/night-shift-refactor
```

На новом ноутбуке:

```powershell
git clone https://github.com/whiskers888/SelectProfi.git
cd SelectProfi
git switch --track origin/feature/night-shift-refactor
```

Если репозиторий уже клонирован:

```powershell
git fetch origin
git switch feature/night-shift-refactor
git pull --ff-only
```

## MCP-серверы Codex CLI

Ниже команды для серверов, зарегистрированных на основном компьютере по `codex mcp list` (проверено 2026-11-21). `codex mcp add` регистрирует сервер в пользовательском профиле Codex; это не переносит его токены или само приложение. На ноутбуке заранее установите Codex CLI, Node.js/npm для `npx`-серверов и .NET SDK для `dotnetdevmcp`. После настройки проверьте список командой `codex mcp list`. Формат CLI описан в [официальной документации Codex MCP](https://developers.openai.com/learn/docs-mcp).

### CodeXRay

```powershell
codex mcp add codexray -- npx -y codexray serve
```

Из корня проекта создайте локальный индекс. Папка `.codexray/` исключена из Git, поэтому её нужно пересоздать на ноутбуке:

```powershell
npx -y codexray init --index --no-hooks
npx -y codexray index --force --quiet
```

### Playwright

```powershell
codex mcp add playwright -- npx -y @playwright/mcp@latest
```

### YouGile

Ключ вводится через защищённый prompt, а не литералом в команде, чтобы не записать его в историю PowerShell. Codex сохранит его в локальной конфигурации пользователя; не добавляйте этот профиль в Git.

```powershell
$secureKey = Read-Host "YouGile API key" -AsSecureString
try {
    $credential = [System.Management.Automation.PSCredential]::new("yougile", $secureKey)
    $apiKey = $credential.GetNetworkCredential().Password
    codex mcp add yougile --env "YOUGILE_API_KEY=$apiKey" -- npx -y @nebelov/yougile-mcp
}
finally {
    Remove-Variable apiKey, credential, secureKey -ErrorAction SilentlyContinue
}
```

### DotNetDevMCP

На основном компьютере установлена версия `0.3.4` как глобальный .NET tool:

```powershell
dotnet tool install --global dotnetdevmcp --version 0.3.4
codex mcp add dotnetdevmcp -- dotnetdevmcp
```

### Tella и AI Memory

Tella использует OAuth; после добавления сервера выполните вход. Текущая конфигурация AI Memory содержит только адрес локального сервиса и имя переменной токена: `codex mcp add` его не устанавливает. Сначала установите/запустите AI Memory отдельно, задайте `AI_MEMORY_AUTH_TOKEN` в пользовательской среде Windows через доверенное хранилище секретов, затем зарегистрируйте адрес ниже.

```powershell
codex mcp add tella --url https://api.tella.com/mcp
codex mcp login tella

codex mcp add ai-memory --url http://127.0.0.1:49374/mcp --bearer-token-env-var AI_MEMORY_AUTH_TOKEN
```

Адрес AI Memory указан для текущей конфигурации; если сервис на ноутбуке слушает другой порт, подставьте его адрес.

### Caveman

Caveman MCP запускается отдельным локально установленным файлом. Текущая конфигурация содержит путь к бинарному файлу, но не установщик. Сначала установите Caveman из доверенного источника, затем зарегистрируйте его путь:

```powershell
codex mcp add caveman -- "$env:USERPROFILE\.caveman\bin\caveman-mcp.exe"
```

Текущий Codex также показывает `cua_repl` и `node_repl` — это рантаймы приложения Codex; `codex_app` присутствует, но выключен. Для них отдельные команды установки не нужны.

## Интеграции аккаунта

В текущем сеансе доступны ChatGPT Space, Codex Document Control, Figma, GitHub, Google Drive, Hotline, MagicPath, Pets, Plugin Management, Safety Settings, Web Search и Sites. Это интеграции платформы, а не серверы из `codex mcp list`; команды `codex mcp add` для них нет. На ноутбуке подключите нужные приложения в интерфейсе Codex/ChatGPT и выполните вход в соответствующие аккаунты.

## Навыки, инструкции и подключения Codex

- Проектный навык [`.agents/skills/astra-orchestrator/SKILL.md`](../.agents/skills/astra-orchestrator/SKILL.md) хранится в репозитории и будет доступен после clone.
- Корневой `AGENTS.md` сейчас исключён правилом `/agents.md` в `.gitignore`, поэтому текущие проектные инструкции автоматически на ноутбук не попадут. Для одинакового поведения нужно отдельно перенести этот файл либо решить, что общие инструкции следует хранить в Git.
- Глобальные навыки, авторизации и локальные настройки привязаны к среде пользователя и не переносятся одним Git-коммитом. На ноутбуке установите нужные плагины/инструменты и войдите в сервисы отдельно. Не копируйте в репозиторий пользовательский каталог Codex, OAuth-токены или ключи.

## Локальные секреты

`.env`, TLS-сертификат и приватный ключ в `infra/` исключены из Git. Восстановите их на ноутбуке из менеджера паролей или другого доверенного хранилища. Не добавляйте эти файлы в Git.

## Если push недоступен

После коммита можно передать ветку как Git bundle:

```powershell
git bundle create SelectProfi.bundle feature/night-shift-refactor
```

Передайте bundle через зашифрованное хранилище, затем на ноутбуке выполните:

```powershell
git clone --branch feature/night-shift-refactor SelectProfi.bundle SelectProfi
```

Bundle содержит только закоммиченную историю. Для продолжения через общий remote push проще; bundle полезен, когда не нужно публиковать ветку на GitHub.
