# Продолжение работы с ноутбука

## Рекомендуемый вариант: GitHub

Репозиторий подключён к `origin` (`https://github.com/whiskers888/SelectProfi.git`) и имеет публичную видимость. Текущая рабочая ветка — `feature/night-shift-refactor`. Перед этим сохранением локальная ветка опережала `origin` на 32 коммита; push опубликует их и новые коммиты всем.

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

## Навыки, инструкции и подключения Codex

- Проектный навык [`.agents/skills/astra-orchestrator/SKILL.md`](../.agents/skills/astra-orchestrator/SKILL.md) хранится в репозитории и будет доступен после clone.
- Корневой `AGENTS.md` сейчас исключён правилом `/agents.md` в `.gitignore`, поэтому текущие проектные инструкции автоматически на ноутбук не попадут. Для одинакового поведения нужно отдельно перенести этот файл либо решить, что общие инструкции следует хранить в Git.
- Остальные доступные навыки, Codex/MCP-инструменты, авторизации и локальные настройки привязаны к среде пользователя и не переносятся одним Git-коммитом. На ноутбуке установите Codex, войдите в нужные сервисы и отдельно подключите требуемые плагины/инструменты. Не копируйте в репозиторий пользовательский каталог Codex, OAuth-токены или ключи.

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
