# SelectProfi — подключение инструментов Claude Code

Актуально на 08.11.2026

## Как это работает

«В каждом чате» в Claude Code достигается тремя механизмами, и у каждого инструмента свой. Плагины включаются через `enabledPlugins` в `.claude/settings.json` репозитория — тогда они активны у всех, кто клонирует проект. Скиллы кладутся в `.claude/skills/` и коммитятся. `CLAUDE.md` грузится в каждую сессию и говорит, какой скилл когда применять.

| Инструмент | Тип | Где живёт | Как «всегда включён» |
| --- | --- | --- | --- |
| Caveman | плагин + хуки | user или project | хук сам активирует режим в начале сессии |
| Anti-Slop (iCodeCraft) | скиллы | `.claude/skills/` | ссылка в `CLAUDE.md` + автоподгрузка по задаче |
| Gwitchr/skills | скиллы | `.claude/skills/` | ссылка в `CLAUDE.md` |
| QRSPI (qrspi-plus) | плагин | project | включён, но запускается по задаче, не на каждый вопрос |
| HAPI | обёртка CLI | машина | запускать `hapi` вместо `claude` |
| Свой .NET skill | скилл | `.claude/skills/` | ссылка в `CLAUDE.md` |

Это относится к Claude Code (терминал). В веб-чате claude.ai плагины и хуки не работают; там скиллы загружаются отдельно в настройках.

## Шаг 0. Предусловия

- Claude Code установлен и залогинен: `claude` есть в PATH.
- Node.js 18+ (нужен для `npx skills` и HAPI).
- `git` и `gh` (QRSPI создаёт worktree и PR через `gh pr create`).
- Работаем из корня репозитория SelectProfi, на отдельной ветке `chore/agent-tooling` — все изменения в `.claude/` и `CLAUDE.md` пойдут одним PR.

```bash
cd selectprofi
git checkout -b chore/agent-tooling
mkdir -p .claude/skills
```

## Шаг 1. Caveman (уже активен — проверить и закрепить)

Caveman режет только выходные токены; сам скилл добавляет около 1–1,5 тыс. входных токенов на каждый ход. Плагин ставит хуки, которые включают режим с первого сообщения, без `/caveman`.

```bash
claude plugin marketplace add JuliusBrussee/caveman
claude plugin install caveman@caveman
```

Чтобы он был у всех в проекте, а не только на вашей машине, — блок в `.claude/settings.json` (шаг 7).

Оговорки для SelectProfi:

- Не прогонять `/caveman:compress` по `CLAUDE.md` целиком. Он переписывает текст в телеграфный стиль; формулировки инвариантов (shortlist только из pool, контакты на 180 дней, алиас вместо ФИО) должны остаться дословными. Если сжимать — только описательные разделы, бэкап `CLAUDE.original.md` не удалять.
- Caveman влияет на ответы в чате, не на код и не на тексты в `docs/`. Для PR-описаний и документации его стиль не подходит.

## Шаг 2. Anti-Slop

Под именем «anti-slop» на GitHub несколько разных проектов; для кода нужен `iCodeCraft/anti-slop`. Остальные (anti-ai-slop, slopkit, stop-slop) — про прозу. В нём три скилла: `kill-slop` (минимальные диффы, без лишних файлов, зависимостей и комментариев), `security-review` (ревью диффа на authz, инъекции, секреты), `pr-hygiene` (чистый PR).

```bash
npx skills add iCodeCraft/anti-slop -a claude-code -y
# скиллы лягут в .claude/skills/ — закоммитить
```

**Конфликт, который надо закрыть сразу.** `kill-slop` прямо запрещает выдумывать деревья `domain/` / `application/` / `infrastructure/`. У SelectProfi это принятая архитектура backend (Api / Application / Domain / Infrastructure). Без оговорки агент начнёт складывать новый код мимо слоёв. В `CLAUDE.md` нужна строка о приоритете (шаг 7).

`security-review` полезен под ваши инварианты: проверка «чужой id ≠ право доступа» — это правило про контакты кандидата и доступ Customer только после финального выбора.

## Шаг 3. Gwitchr/skills — брать выборочно

Поправка к исходной оценке: набор построен на TanStack Query v5, Prisma и MongoDB, а не на RTK Query; Radix в нём не упоминается. Подходят два-три скилла. У репозитория 0 звёзд — перед коммитом прочитать каждый SKILL.md.

| Скилл | Решение | Почему |
| --- | --- | --- |
| `components-hierarchy` | брать | React/TS/Tailwind, варианты и размеры через словари, композиция, React 19 |
| `pedantic-react` | брать после чтения | конвенции React; содержимое не описано в README — проверить |
| `agents-md` | взять разово | вычистить `CLAUDE.md` до правил, которые агент иначе нарушит |
| `smart-tanstack-query`, `zod-prisma-tanstack` | нет | TanStack Query, а у вас RTK Query |
| `auth-stack`, `content-stack`, `image-storage` | нет | Better Auth, Mongo, S3 — не ваш стек |
| `deslop` | нет | дублирует Anti-Slop, но для прозы |

Установки через CLI нет — копируем папки. README предлагает `.agents/skills/`, но Claude Code читает `.claude/skills/`:

```bash
git clone --depth 1 https://github.com/Gwitchr/skills /tmp/gwitchr
cp -r /tmp/gwitchr/components-hierarchy .claude/skills/
cp -r /tmp/gwitchr/pedantic-react .claude/skills/
rm -rf /tmp/gwitchr
```

В `CLAUDE.md` указать, что `docs/system-design-ui-ux.md` важнее любого скилла, иначе `components-hierarchy` может подсказать литералы Tailwind-цветов.

## Шаг 4. QRSPI (qrspi-plus) — включён всегда, запускается по задаче

Конвейер Goals → Questions → Research → Design → Phasing → Structure → Plan → Parallelize → Implement → Integrate → Test с ручным гейтом после каждого шага. Короткий маршрут quick fix для правок в 1–3 файла: Goals → Questions → Research → Plan → Implement → Test.

```bash
# внутри claude
/plugin marketplace add dfrysinger/qrspi-plus
/plugin install qrspi@qrspi-local
```

Почему не на каждый вопрос:

- Входной скилл `using-qrspi` весит около 30 тыс. токенов — это съедает экономию Caveman на десятки ответов.
- Implement — строгий TDD плюс 4–8 ревьюеров на задачу. Для вопроса «где лежит этот endpoint» это лишнее.

Правило: полный маршрут — новые фичи потока Order → Vacancy → Pool → Shortlist; quick fix — баги; вопросы и мелкие правки — без QRSPI. Артефакты пишутся в `docs/qrspi/<дата>-<slug>/`, их коммитить вместе с PR.

Research должен читать `docs/frontend-api-contracts.md` и `docs/testing/flow-audit-order-vacancy-candidate.md`, а не `docs/pages/*.html`, иначе примет preview за реализованное.

## Шаг 5. HAPI — управление с телефона

HAPI — обёртка вокруг официального Claude Code: сессия идёт локально, с телефона через Web/PWA или Telegram Mini App можно смотреть, писать и одобрять действия. «В каждом чате» = запускать `hapi` вместо `claude`.

```bash
npm install -g @twsxtd/hapi      # или: brew install tiann/tap/hapi

# терминал 1 — хаб с E2E-шифрованным relay
hapi hub --relay
# покажет URL и QR-код — открыть на телефоне, добавить на экран «Домой»

# терминал 2 — в корне репозитория вместо claude
cd selectprofi && hapi
```

Токен доступа хранится в `~/.hapi/settings.json` — в репозиторий не класть. Алиас в `~/.zshrc` / `~/.bashrc`: `alias cc='hapi'`.

HAPI запускает тот же `claude`, поэтому плагины и скиллы подхватываются сами. С телефона не нажимать «Разрешить всё», особенно на шаге QRSPI Integrate (push, CI).

## Шаг 6. Свой skill для .NET backend

Файл `.claude/skills/selectprofi-backend/SKILL.md`:

```markdown
---
name: selectprofi-backend
description: Use when adding or changing backend code in SelectProfi (ASP.NET Core, .NET 10, EF Core) — endpoints, commands/queries, entities, migrations, integration tests.
---

# SelectProfi backend

## Слои (существующие, не выдумывать новые)
- Api — контроллеры, маппинг в problem+json. Без бизнес-логики.
- Application — команды/запросы (CQRS), валидация, проверка прав.
- Domain — сущности и инварианты. Не зависит от EF и ASP.NET.
- Infrastructure — EF Core, PostgreSQL, Redis, RabbitMQ.

## Именование
<перенести сюда CQRS naming из CLAUDE.md>

## Инварианты — проверять в Domain/Application, не в контроллере
- Shortlist только из Pool той же вакансии.
- selectedCandidateId — только из Shortlist той же вакансии; один на вакансию.
- Контакты: первый привязавший рекрутер — 180 дней; Customer — после финального выбора; остальным — нет.
- Без права на контакты — алиас «Прилагательное + Специализация» вместо ФИО.
- Стадии MVP — только Pool и Shortlist.

## Новый endpoint — чек-лист
- [ ] Ошибки — application/problem+json.
- [ ] Виден в GET /openapi/v1.json.
- [ ] Integration-тест: happy path.
- [ ] Integration-тест: 403 для каждой непринадлежащей роли.
- [ ] Контракт обновлён в docs/backend/api/<домен>.
- [ ] Отмечено, вызывает ли его frontend (docs/frontend-api-contracts.md).
```

Раздел про backend в `CLAUDE.md` сокращается до ссылки на скилл; инварианты остаются в `CLAUDE.md` (общие для frontend и backend).

## Шаг 7. Итоговые файлы в репозитории

**`.claude/settings.json`** — плагины на уровне проекта. Имена маркетплейсов сверить с выводом `/plugin` после шагов 1 и 4.

```json
{
  "extraKnownMarketplaces": {
    "caveman": { "source": { "source": "github", "repo": "JuliusBrussee/caveman" } },
    "qrspi-local": { "source": { "source": "github", "repo": "dfrysinger/qrspi-plus" } }
  },
  "enabledPlugins": {
    "caveman@caveman": true,
    "qrspi@qrspi-local": true
  }
}
```

**Блок в `CLAUDE.md`** — после раздела «Стиль работы над кодом»:

```markdown
## Инструменты агента

Приоритет при конфликте: этот файл и docs/ > скиллы > стиль по умолчанию.

- Код: всегда применять `kill-slop`. Слои Api/Application/Domain/Infrastructure — существующая архитектура, не «выдуманные слои»; запрет kill-slop касается только новых слоёв и абстракций на один случай.
- Backend: перед правкой загрузить скилл `selectprofi-backend`.
- Frontend: `components-hierarchy` и `pedantic-react`. Цвета — только токены из docs/system-design-ui-ux.md, даже если скилл предлагает литералы Tailwind. Данные — RTK Query, не TanStack Query.
- Перед PR: `/security-review` по диффу (особенно доступ к контактам и выбор кандидата), затем `/pr-hygiene`.
- QRSPI: полный маршрут — новые фичи потока Order→Vacancy→Pool→Shortlist; quick fix — баги; вопросы и мелкие правки — без QRSPI. Research читает docs/frontend-api-contracts.md и docs/testing/*, не docs/pages/*.html.
- Caveman: только для ответов в чате. PR-описания, docs/ и комментарии в коде — полным языком.
```

```bash
git add .claude/ CLAUDE.md
git commit -m "chore: agent tooling (caveman, anti-slop, qrspi, react skills, backend skill)"
```

## Шаг 8. Проверка и отложенное

Новая сессия (`hapi` или `claude` из корня):

- [ ] `/plugin` показывает `caveman` и `qrspi` включёнными.
- [ ] Первый ответ уже в стиле Caveman, без `/caveman`.
- [ ] Доступны скиллы `kill-slop`, `security-review`, `pr-hygiene`, `components-hierarchy`, `pedantic-react`, `selectprofi-backend`.
- [ ] «Добавь endpoint X в Application» — код в существующих слоях, упомянут integration-тест на 403.
- [ ] «Поменяй цвет кнопки» — через токены, а не `bg-blue-500`.
- [ ] Телефон открывает сессию через QR-код HAPI и может одобрить действие.

Отложено:

- **UX/UI Agent Skills (WCAG-гейты)** — после закрытия долга по тёмной теме в `shell.css`.
- **openapphub/claude-skills**, **full-stack-skills/react-skills** — не берём.

## Источники

- https://github.com/JuliusBrussee/caveman
- https://github.com/iCodeCraft/anti-slop
- https://github.com/Gwitchr/skills
- https://github.com/dfrysinger/qrspi-plus
- https://github.com/tiann/hapi
