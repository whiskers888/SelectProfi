
## NS-00 | Аудит dashboard-app и карта безопасной интеграции
Старт: 2026-11-14 01:54:07 +03:00
Окончание: 2026-11-14 01:55:23 +03:00
Статус: Review
Изменения: первичный анализ production слоёв и прототипа; изучены макеты `_1` (исполнитель), `_2` (заказчик), `_3` (соискатель).
Ошибки/заметки: прототипный backend собирает dashboard в контроллере, использует presentation seed и `EnsureCreated`; production использует CQRS/EF, эти модели и подход не переносить. Applicant API отсутствует; customer candidate projection раскрывает полное имя в части случаев. Production сейчас .NET 10/React 19 и dev compose — зафиксированы отдельными задачами.
Проверка: dotnetdevmcp backend/Api/Api.csproj — success, 0 errors, 0 warnings.
Коммит: feature/night-shift-refactor / feat: NS-00 аудит dashboard-app и карта интеграции / cd13f4dc4b4b92768505a90c36164c545c654a87.



## NS-01 | Модели Wallet и Notification, миграция и seed
Старт: 2026-11-14 01:56:21 +03:00
Окончание: 2026-11-14 02:04:58 +03:00
Статус: Review
Изменения: добавлены Wallet и Notification с FK/index/precision; создана EF migration; development seed обеспечивает кошелёк и три уведомления для demo-ролей, включая Applicant; seed защищён PostgreSQL transaction advisory lock.
Ошибки: ревью выявило race condition check-then-insert; устранён транзакционной advisory lock. Не осталось.
Проверка: dotnet ef migrations add AddDashboardWalletAndNotifications — success; dotnetdevmcp build backend/Api/Api.csproj — success, 0 errors, 0 warnings. Миграция к БД в этом шаге не применялась.
Коммит: feature/night-shift-refactor / feat: NS-01 модели Wallet и Notification, миграция и seed / e1788e9166061d7abeff208018836318fe9c884e.



## NS-02 | Dashboard API и Applicant CQRS endpoint
Старт: 2026-11-14 02:05:37 +03:00
Окончание: 2026-11-14 02:12:20 +03:00
Статус: Review
Изменения: добавлен Applicant CQRS endpoint; customer/executor получили данные Wallet/Notification; добавлены точные маршруты /customer, /executor, /applicant с сохранением старых stats aliases.
Ошибки: первый build выявил CS0246 для GetApplicantDashboardStatsPersistence из-за пропущенного using в Infrastructure DI; using добавлен, повторный build прошёл.
Проверка: dotnetdevmcp backend/Api/Api.csproj — success, 0 errors, 0 warnings; reviewer: no material findings. HTTP/SQL execution не запускались.
Коммит: feature/night-shift-refactor / feat: NS-02 Dashboard API и Applicant CQRS endpoint / f299e308129380597d3d43a428206c7f2ee8e03a.



## NS-03 | Политика псевдонимов кандидатов для заказчика
Старт: 2026-11-14 02:13:06 +03:00
Окончание: 2026-11-14 02:19:14 +03:00
Статус: Review
Изменения: customer responses теперь всегда псевдонимны в `DisplayName` и `PublicAlias`; добавлен стабильный CandidatePublicAlias для registered/legacy записей; новый applicant candidate получает alias при создании; executor/admin и отдельный selected-candidate contacts path сохранены.
Ошибки: первый перевод задачи в YouGile не прошёл из-за одной ошибочной буквы в UUID; исправлен правильным ID. Кодовых ошибок после сборки нет.
Проверка: dotnetdevmcp backend/Api/Api.csproj — success, 0 errors, 0 warnings; static reviewer — no material findings.
Коммит: feature/night-shift-refactor / feat: NS-03 политика псевдонимов кандидатов для заказчика / aa4a0c743fd8031119fa8a3f65b7be05b582b839.



## NS-04 | Совместимость frontend с React 18 и дизайн-токены dashboard
Старт: 2026-11-14 02:20:00 +03:00
Окончание: 2026-11-14 02:33:08 +03:00
Статус: Review
Изменения: React/ReactDOM и типы выровнены на 18; lockfile обновлён без несвязанных Floating UI/set-cookie-parser изменений; переиспользован tailwind.config.cjs и design token generator, border/input приведены к #D7E5DF.
Ошибки: один npm install по ошибке запускался в корне; созданные им пустые package files удалены, типы установлены из frontend. npm build сообщает только устаревший Browserslist и большой существующий JS chunk.
Проверка: frontend `npm run build` — success (tsc + Vite); React runtime/types версии согласованы; reviewer — no material findings.
Коммит: feature/night-shift-refactor / feat: NS-04 React 18 и dashboard design tokens / 30f2deec300be5b67c94597e69eda50a722b7b8f.



## NS-05 | Типы и клиент dashboard API для трёх ролей
Старт: 2026-11-14 02:33:45 +03:00
Окончание: 2026-11-14 02:48:44 +03:00
Статус: Review
Изменения: добавлены строгие DTO-типы и Applicant dashboard query; данные соискателя отображаются только из API, отклик инвалидирует Applicant stats cache. Кнопки обзора Applicant скрыты без поддерживаемого маршрута.
Ошибки: первый build выявил отсутствующие новые поля в тестовых fixtures — добавлены. Ревью нашло устаревание Applicant stats после отклика и неверный маршрут кнопок; исправлено. Финальная сборка прошла, остались предупреждения об устаревшем Browserslist и крупном JS chunk.
Проверка: frontend `npm run build` — success (tsc + Vite, 2012 modules); `git diff --check` — success; независимое ревью — no issues. Тесты не запускались.
Коммит: feature/night-shift-refactor / feat: NS-05 | Типы и клиент dashboard API для трёх ролей / c971722.


## NS-06 | Общий dashboard shell и UI-элементы
Старт: 2026-11-14 02:50:35 +03:00
Окончание: 2026-11-14 12:17:38 +03:00
Статус: Review
Изменения: бренд перенесён в общую верхнюю панель; роль, создание и счётчики размещены в sidebar по макетам; счётчик dashboard берётся из API-метрики роли. Сохранены существующие навигация, профиль, поиск, быстрые действия и мобильный drawer; действие создания закрывает drawer. Добавлены `aria-current` и доступные подписи счётчиков.
Ошибки: первый build выявил новые обязательные props в существующих Sidebar fixtures — обновлены. Ревью нашло незакрытый мобильный drawer, отсутствие Material Symbols шрифта и устаревшее ожидание бренда — исправлено. Финальный build прошёл; предупреждения: устаревший Browserslist, крупный JS chunk и plugin timing.
Проверка: frontend `npm run build` — success (tsc + Vite, 2012 modules); `git diff --check` — success; независимое ревью — без оставшихся замечаний. Тесты и браузерная проверка responsive/keyboard поведения не запускались.
Коммит: feature/night-shift-refactor / feat: NS-06 | Общий dashboard shell и UI-элементы / db45449.


## NS-07 | Dashboard заказчика: escrow и безопасный shortlist
Старт: 2026-11-14 12:18:00 +03:00
Окончание: 2026-11-14 12:39:13 +03:00
Статус: Review
Изменения: customer dashboard показывает доступный баланс и общий резерв wallet из API; shortlist использует только server public alias и показывает вакансию, статус и дату обновления. Добавлены loading/error/empty/retry состояния для stats, заказов и shortlist; список привязан к текущей вакансии и не использует ручные клиентские кандидаты.
Ограничения данных: API не содержит escrow по отдельным заказам, résumé experience/skills/salary или match score для кандидатов заказчика; эти значения не отображаются.
Ошибки: независимое ревью выявило неучтённую загрузку/ошибку prerequisite вакансий и риск старого candidate response при переключении вакансии — добавлены prerequisite states/retry, RTK `currentData` и проверка vacancyId.
Проверка: frontend `npm run build` — success (tsc + Vite, 2012 modules); `git diff --check` — success; независимое ревью — без оставшихся замечаний. Тесты и runtime сетевые сценарии не запускались.
Коммит: feature/night-shift-refactor / feat: NS-07 | Dashboard заказчика: escrow и безопасный shortlist / 39c5069.


## NS-08 | Dashboard исполнителя: кошелёк, Pool и Shortlist
Старт продолжения: 2026-11-14 12:50:15 +03:00
Окончание: 2026-11-14 13:01:42 +03:00
Статус: Review
Изменения: добавлены доступный и зарезервированный балансы из executor dashboard API; сводка кандидатов берёт только этапы Pool/Shortlist/Выбран из vacancy API, исключая личные анкеты и записи без этапа. Сохранена общая вкладка кандидатов; добавлены состояния загрузки/ошибки и retry для stats и сводки кандидатов.
Ошибки: промежуточная сборка нашла незаведённый проп `executorDashboardCandidates` в controller/view; проп протянут по цепочке. Финальная сборка без ошибок.
Проверка: frontend `npm run build` — success (tsc + Vite, 2012 modules); `git diff --check` — success; независимое ревью — без оставшихся замечаний. Предупреждения сборки: устаревший Browserslist и JS chunk >500 kB. Браузерные и runtime API сценарии не запускались.
Коммит: feature/night-shift-refactor / feat: NS-08 | Dashboard исполнителя: кошелёк, Pool и Shortlist / 35cef5f.

## NS-09 | Dashboard соискателя: отклики и активность резюме
Старт реализации: не зафиксирован в предыдущем фрагменте; финализация после продолжения: 2026-11-14 13:37:06 +03:00
Окончание: 2026-11-14 13:40:14 +03:00
Статус: Review
Изменения: добавлены API-данные Applicant dashboard по откликам и активности резюме, provenance подачи отклика с миграцией, типизированный frontend раздел «Мои отклики» со статусами и состояниями загрузки/ошибки/пустого результата. Событие возврата к dashboard обновляет данные только при активном Applicant-запросе (`dashboardRole`).
Ошибки: ревью выявило потенциальный refetch для пропущенного query при различии profile role и auth role; условие обновления синхронизировано с `dashboardRole`. Других замечаний нет.
Проверка: dotnetdevmcp `backend/Api/Api.csproj` — success, 0 errors, 0 warnings; frontend `npm run build` — success (2013 modules); `git diff --check` — success; повторное ревью — без замечаний. Build warnings: устаревший Browserslist, bundle 1,091.94 kB, plugin timing. Runtime API и применение миграции к БД не выполнялись.
Коммит: `feature/night-shift-refactor` / `feat: NS-09 Dashboard соискателя: отклики и активность резюме` / `2ae87e7`.

## NS-10 | Production Docker: multi-stage build и единый compose
Старт: около 2026-11-14 13:40:14 +03:00; точный момент перевода в In Progress не был записан в предыдущем фрагменте.
Окончание: 2026-11-14 14:32:02 +03:00
Статус: Done после Review; последняя задача, созданная по эпикам PROJECT_REQUIREMENTS.md.
Изменения: сохранён backend multi-stage image на .NET 10; добавлены production frontend image (Node 22 build + Nginx), SPA fallback и same-origin API/health proxy. Compose заменяет Vite dev server на статические ассеты, сохраняет Postgres/Redis/RabbitMQ/Caddy, добавляет health/dependency checks, proxy network с фиксированными KnownProxies и loopback-only app/frontend ports. Backend dependency health details закрыты от внешних proxy маршрутов; лимит Nginx 26 MiB позволяет файл до 25 MiB с multipart overhead. Обновлена документация на .NET 10 по последнему решению пользователя. Закреплены совместимые исправленные версии AWSSDK.Core, Microsoft.OpenApi и System.Security.Cryptography.Pkcs; Tiptap family/lockfile согласованы на 3.34.0.
Ошибки: первые Docker publish обнаружили advisories для AWSSDK.Core и Microsoft.OpenApi; package pins устранили их, затем выявлен advisory System.Security.Cryptography.Pkcs и обновлён до 9.0.21. Runtime npm audit выявил 6 high advisories; `npm audit fix --omit=dev` устранил их, после чего сборка обнаружила рассогласование Tiptap core/react 3.34/3.22; все прямые Tiptap зависимости выровнены на 3.34.0. Отдельная проверка Nginx вне Compose сначала не разрешила hostname `app`; повторная syntax check с тестовым DNS alias прошла. Полный npm install по-прежнему сообщает о 24 уязвимостях dev/build tree (1 low, 12 moderate, 11 high); runtime-only audit чистый.
Проверка: dotnetdevmcp `backend/Api/Api.csproj` — success, 0 errors/warnings; NuGet vulnerable scan для Api/Infrastructure — без уязвимых пакетов; frontend `npm run build` — success (2015 modules); `npm audit --omit=dev` — 0 vulnerabilities; `docker compose config --quiet` — success с временными валидационными значениями секретов и проверкой fallback Postgres connection string; `docker compose build app frontend` — success; Nginx `-t` — success; Caddy `adapt` — success; `git diff --check` — success; независимое ревью — без оставшихся замечаний. Compose runtime и приложение не запускались; реальные `JWT_SIGNING_KEY` и `RABBITMQ_DEFAULT_PASS` должны быть добавлены в локальный `.env` перед запуском.
Коммит: `feature/night-shift-refactor` / `feat: NS-10 Production Docker и единый compose` / `95c8fc8`.

## NS-10 follow-up | Доступ production frontend на localhost
Старт: 2026-11-14 15:30:37 +03:00
Статус: In Progress
Основание: runtime-проверка показала, что frontend в internal api_proxy не публикует порт 127.0.0.1:5173; добавляется отдельная frontend_local bridge-сеть без доступа к data/БД.
Окончание: 2026-11-14 15:35:18 +03:00
Изменения: frontend получил отдельную non-internal bridge-сеть только для loopback-доступа; api_proxy остался internal, data/БД недоступны frontend.
Ошибки: до исправления Nginx был healthy внутри контейнера, но внутренний api_proxy блокировал публикацию порта и localhost:5173 отвергал соединение.
Проверка: npm run build — success (2015 modules); docker compose build frontend — success; docker compose config --quiet — success; /app HTTP 200; frontend и backend healthy; PostgreSQL не перезапускался и его volume сохранён.
Статус: готово к Review.
Коммит: feature/night-shift-refactor / feat: NS-10 expose frontend on localhost / d957da1

## AUDIT-01 | Полный аудит production Dashboard и план исправлений
Старт: 2026-11-14 16:17 +03:00
Окончание: 2026-11-14 16:44 +03:00
Статус: Review
Изменения: создан `docs/pages/dashboard/DASHBOARD_AUDIT.md` с картой текущей архитектуры, сравнением ролей `_1`–`_3`, подтверждёнными gaps, baseline-проверками и последовательным планом. Код не менялся; существующие dashboard tasks проверены в YouGile, дубли не создавались.
Ошибки/ограничения: frontend baseline — 4 существующих падения MainFeedPanel tests; backend integration tests — 42 из 52 не проходят из-за DB authentication failure пользователя `neondb_owner`; авторизованная сессия Dashboard не открылась, `/app` перенаправил на `/auth`.
Проверка: `dotnetdevmcp` build `backend/Api/Api.csproj` — success, 0 errors/warnings; `npm run build` — success (2016 modules); frontend tests — 40/44 passed; backend integration tests — 10/52 passed; Playwright 1.65.1 через Edge: auth page HTTP 200, без JS errors и horizontal overflow при viewport 1365 px; `git diff --check` — success.
Коммит: feature/night-shift-refactor / feat: NS-00 Полный аудит Dashboard / 4655df6

## NS-08 follow-up | Дашборд исполнителя по макету _1
Старт: 2026-11-14 15:38:42 +03:00
Статус: Review
Сверка: production frontend теперь доступен по /app; текущий экран показывает общие показатели, список проектов и общий список кандидатов, но не открывает детали выбранного проекта и его Pool/Shortlist рядом со списком.
Окончание: 2026-11-14 15:54:14 +03:00
Изменения: добавлен экран исполнителя по `_1`: список проектов, детали выбранного проекта и Pool/Shortlist/Выбран; кандидаты ограничены выбранным orderId и допустимыми этапами, данные идут через существующий dashboard API. Экран подключён только для роли Executor; добавлены состояния загрузки/ошибки с повтором. Устаревшие preview11 стили заменены на Tailwind.
Ошибки: проверка браузером не выполнена — CUA browser access host недоступен. Сборки прошли; остались предупреждения Browserslist (caniuse-lite устарел на 8 месяцев) и крупного JS bundle (1,139.45 kB).
Проверка: reviewer — без существенных замечаний; `npm run build` — success (2016 modules); `docker compose build frontend` — success; пересоздан только frontend через `docker compose up -d --no-deps --force-recreate frontend`; `http://127.0.0.1:5173/app` — HTTP 200, новый bundle содержит Pool/Shortlist/«Выбранный проект»; frontend/backend/PostgreSQL healthy, БД не перезапускалась; `git diff --check` — success.
Коммит: feature/night-shift-refactor / feat: NS-08 Дашборд исполнителя _1 / 5a9c86b

## NS-08 follow-up | Действия кандидатов в Dashboard исполнителя
Старт: 2026-11-14 16:45 +03:00
Окончание: 2026-11-14 19:54 +03:00
Статус: Review
Изменения: в executor dashboard подключены существующая stage mutation для Pool/Shortlist, кнопки обоих переходов с блокировкой на время запроса и явный переход к полным деталям проекта. Stage update вынесен в чистый helper с областью действия orderId + candidateId; исходная заметка кандидата больше не перезаписывается псевдо-временем. Устаревшие тесты текущего shell обновлены на проверяемые сценарии.
Ошибки/заметки: первый запуск проверок выявил устаревшие assertions в MainFeedPanel и неоднозначное ожидание одинаковой цены у двух карточек; тесты исправлены через реальные доступные роли и проверку выбранного orderId.
Проверка: `npm run build` — success (2016 modules); helper и dashboard panel тесты — 18/18; полный frontend suite — 51/51, 14/14 файлов; `git diff --check` — success; reviewer — без замечаний. Dashboard browser view не подтверждён: /app перенаправляет на /auth.
Коммит: feature/night-shift-refactor / feat: NS-08 Действия кандидатов в Dashboard исполнителя / 8e8e269

## NS-08 follow-up | Выбор финалиста в Dashboard заказчика
Старт: 2026-11-14 20:02 +03:00
Окончание: 2026-11-14 20:20 +03:00
Статус: Done
Изменения: подключена существующая Customer-only RTK mutation выбора финалиста. Действие доступно только для Shortlist кандидата текущей опубликованной вакансии; обработчик повторно сверяет роль, order/vacancy, актуальный ответ API, стадию и отсутствие выбранного финалиста. После успеха RTK invalidation обновляет список; pending блокирует действие, ошибки попадают в существующее уведомление. Customer по-прежнему видит `publicAlias`; добавлена проверка helper mapping и UI-контрактов.
Ошибки/ограничения: Playwright MCP не смог найти Chrome; `npx playwright install chrome` завершился ошибкой привилегий. Playwright 1.65.1 запущен напрямую с установленным Edge: `/app` перенаправляет на `/auth`; доступная страница входа не показала JS errors и горизонтального переполнения при ширине 1365 px. Авторизованный Dashboard и сетевой mutation flow не проверены.
Проверка: `npm run build` — success (2016 modules); полный frontend suite — 56/56, 14/14 файлов; `git diff --check` — success; cavecrew reviewer — без замечаний. Build warnings: Browserslist устарел, bundle 1,143.02 kB, plugin timings.
Коммит: feature/night-shift-refactor / feat: NS-08 выбор финалиста заказчиком / 0f4bdc9

## AUDIT-01 follow-up | Детали отклика соискателя
Старт: 2026-11-14 20:22 +03:00
Окончание: 2026-11-14 20:29 +03:00
Статус: Done
Изменения: Applicant может раскрыть выбранный отклик и увидеть сохранённые этап, работодателя, дату отклика, первый просмотр и описание соответствующей опубликованной вакансии. Используются только существующие Applicant-scoped источники; зарплата, адрес, приглашение и расписание не синтезируются. Добавлены component-тесты раскрытия деталей и отсутствующего описания.
Ошибки/ограничения: нет backend-контракта для interview invitations/rescheduling, salary или location в этих Dashboard данных; авторизованная браузерная проверка Applicant экрана невозможна, так как `/app` перенаправляет на `/auth`.
Проверка: `npm run build` — success (2016 modules); полный frontend suite — 58/58, 15/15 файлов; `git diff --check` — success; reviewer — без замечаний.
Коммит: feature/night-shift-refactor / feat: AUDIT-01 детали отклика соискателя / 9e61ddd

## AUDIT-01 follow-up | Честные состояния календаря и чата
Старт: 2026-11-14 20:31 +03:00
Окончание: 2026-11-14 20:42 +03:00
Статус: Done
Изменения: CalendarPanel различает недоступный источник (`null`), подключённый пустой список и реальные встречи; текущий shell явно передаёт unavailable state. Локальное добавление сообщений и success banner удалены; chat empty state сообщает об отсутствии интеграции, composer заблокирован, handler выдаёт честную ошибку.
Ошибки/ограничения: backend не предоставляет API встреч или сообщений, поэтому управление календарём и доставка чатов остаются неподдержанными. Dashboard browser route остаётся за авторизацией `/auth`.
Проверка: `npm run build` — success (2016 modules); полный frontend suite — 62/62, 17/17 файлов; `git diff --check` — success; reviewer — без замечаний.
Коммит: feature/night-shift-refactor / feat: AUDIT-01 honest calendar and chat states / d28d1a2

## AUDIT-01 follow-up | Customer details и согласование Archive
Старт: 2026-11-14 21:34 +03:00 (последняя доступная отметка перед продолжением; точное время возобновления не сохранилось)
Окончание: 2026-11-14 22:11 +03:00
Статус: Review
Изменения: Customer Dashboard показывает детали выбранного заказа рядом со списком и shortlist только этого заказа. В Customer/Executor Dashboard выбор ограничен строками текущего фильтра; shortlist следует за выбранной vacancy, архивные действия доступны только для просмотра. Добавлены component tests для выбора, переключения Active/Archive и изоляции кандидатов.
Ошибки/ограничения: Playwright MCP не запускается без Chrome; для UI smoke использован Playwright 1.65.1 и Edge с изолированными API fixtures. Реальные backend authorization, database и mutation не проверены. В сборке остаются предупреждения Browserslist/chunk size/plugin timings; ESLint оставил один прежний warning в ExecutorDashboardSection useMemo.
Проверка: MainFeedPanel tests — 21/21; `npm run build` — success (2016 modules); ESLint — 0 errors; `git diff --check` — success; Edge smoke Active → Archive → Active без JS errors и stale shortlist; viewport 1365×900 и 390×844 без horizontal overflow; cavecrew reviewer — без замечаний.
Коммит: feature/night-shift-refactor / feat: AUDIT-01 Customer детали и shortlist / d24df1f

## AUDIT-01 follow-up | Applicant список и выбранные детали `_3`
Старт: 2026-11-14 22:11 +03:00
Окончание: 2026-11-14 22:27 +03:00
Статус: Review
Изменения: Applicant Dashboard показывает компактный список откликов слева и детали выбранного отклика справа на широком экране; на mobile layout складывается. Первый доступный отклик выбран по текущим props после async загрузки; при удалении выбора отображается первая запись, при пустом списке детали закрываются. Существующий toggle и доступные API-поля сохранены.
Ошибки/заметки: первый черновик вызвал ESLint `react-hooks/set-state-in-effect`, а async test использовал фиктивно непустой список из-за helper default; эффект удалён в пользу derived selection, fixture исправлен. API не содержит зарплату/локацию/интервью для Applicant.
Проверка: ApplicantApplicationsSection tests — 5/5; `npm run build` — success (2016 modules); ESLint затронутых файлов — без замечаний; `git diff --check` — success; Edge Playwright fixtures проверили выбор, hide/re-show и mobile/desktop layout без JS errors и horizontal overflow; reviewer — без замечаний.
Коммит: feature/night-shift-refactor / feat: AUDIT-01 Applicant детали и выбор / 67c8cb0

## AUDIT-01 follow-up | Executor композиция `_1`
Старт: 2026-11-14 22:27 +03:00
Окончание: 2026-11-14 22:44 +03:00
Статус: Review
Изменения: убран общий ряд KPI-карточек только из Executor Dashboard — в `_1` проектный список и выбранный проект начинаются непосредственно под заголовком. Customer/Applicant KPI, `runtimeStats` боковой панели и controller query сохранены.
Ошибки/заметки: первая сборка после удаления UI обнаружила три неиспользуемых bindings в `WorkspaceShellView`; bindings удалены, а controller output оставлен без изменений. Сборка после исправления прошла.
Проверка: полный frontend suite — 71/71 в 17 файлах; `npm run build` — success (2016 modules); ESLint `WorkspaceShellView.tsx` — без замечаний; `git diff --check` — success; Edge Playwright fixtures для трёх ролей прошли при 1365×900/390×844 без JS errors и horizontal overflow; reviewer — без замечаний.
Коммит: feature/night-shift-refactor / feat: AUDIT-01 Executor без лишних KPI / 4d775c8

## AUDIT-01 follow-up | Остатки Codex и первая реальная авторизованная проверка
Старт: 2026-11-14 23:05 +03:00
Окончание: 2026-11-14 23:22 +03:00
Статус: Review
Изменения: незакоммиченный остаток Codex — карточка «Вознаграждение» в sidebar исполнителя с состояниями loading/error/retry и компонентными тестами — зафиксирован отдельным коммитом; ТЗ аудита `docs/pages/dashboard/DASHBOARD_TASK.md` добавлено в репозиторий. Впервые выполнена авторизованная проверка Dashboard настоящей сессией через форму `/auth` без перехвата API: Playwright 1.65.1 + Chromium 1255 против Vite dev server на 5175.
Ошибки/ограничения: контейнер backend работает с `ASPNETCORE_ENVIRONMENT=Production` и внешней БД Neon, поэтому dev-seed (`Program.cs:197-249`) не выполняется. В этой БД `executor@selectprofi.local` аутентифицируется с ролью `Applicant` (и JWT, и `/api/auth/me`), из-за чего `dashboard/executor` возвращает 403. Маппинг ролей в коде (`RegisterUserRequest.NormalizeRoles`, клейм в `SimpleJwtAuthenticationHandler`) корректен, расхождение относится к данным БД; Executor UI остаётся непроверенным. Автоматическая сверка текста с макетами даёт много ложных «пропусков», так как макеты содержат вымышленные ФИО, номера и суммы; учитывались только структурные элементы.
Проверка: `npm run build` — success (2016 modules); полный frontend suite — 73/73 в 17 файлах; `git diff --check` — success. Playwright: Customer и Applicant вошли реальной сессией, `/app` открылся, JS/console errors 0, горизонтального overflow нет при 1365×900 и 390×844. Customer: 4 реальных заказа, 9 кандидатов на рассмотрении, выбранный заказ с деталями и shortlist. Applicant: 0 подтверждённых откликов, «Резюме не заполнено», честное сообщение о 3 записях без сохранённого источника. Скриншоты вне репозитория в `%LOCALAPPDATA%\Temp\opencode\dashboard-smoke\`.
Коммит: feature/night-shift-refactor / feat: AUDIT-01 вознаграждение исполнителя в sidebar / d503635; docs: добавить ТЗ аудита Dashboard / 23396fa.

## AUDIT-01 follow-up | Повторная проверка Sidebar исполнителя
Старт: 2026-11-15 00:43 +03:00
Окончание: 2026-11-15 00:52 +03:00
Статус: Done
Изменения: повторно проверена карточка «Вознаграждение» из `d503635`; Sidebar получает готовые доступный и резервный балансы из Executor `runtimeStats`, без вымышленных выплат/рейтинговых/налоговых значений.
Ошибки/ограничения: MCP Playwright после перезапуска всё ещё не находит Chrome. Живая тестовая учётная запись backend определяется как Applicant, поэтому Executor authorization/live DTO не подтверждены.
Проверка: `Sidebar.test.tsx` — 4/4; `npm run build` — success (2016 modules); Playwright 1.65.1 + Edge с API fixtures: карточка видна, keyboard-фильтры Shortlist/Pool работают, viewport 1365×900 и 390×844 без overflow, page errors — 0; reviewer — без замечаний.
Коммит кода: feature/night-shift-refactor / feat: AUDIT-01 вознаграждение исполнителя в sidebar / d503635.

## PRI-145 | Кнопки обзора кандидатов в проектах исполнителя
Старт: 2026-11-15 00:54 +03:00
Окончание: 2026-11-15 01:13 +03:00
Статус: Review
Изменения: stage-фильтры в таблице кандидатов выбранного проекта получили явные действия «Обзор всех кандидатов» и «Обзор финалистов». Первый показывает Pool/Shortlist/Selected выбранного проекта; второй — только Shortlist. Оставлены Pool и Выбран. Общий KPI-ряд не возвращался; кнопки не ведут в глобальный список, который не содержит полный Executor pipeline.
Ошибки/ограничения: в `_1` нет глобальных кнопок «Обзор»; задачу согласовал с макетом через существующий project-scoped список. «Финалисты» интерпретированы как Shortlist по `shortlistCandidatesCount`; уже выбранный кандидат остаётся отдельным этапом. Live Executor API остаётся неподтверждённым из-за роли Applicant у тестовой записи backend.
Проверка: `MainFeedPanel.test.tsx` — 22/22; `npm run build` — success (2016 modules); ESLint изменённых файлов и `git diff --check` — success; Playwright 1.65.1 + Edge fixture: Pool → все кандидаты → финалисты, только выбранный проект, viewport 1365×900/390×844 без overflow, page errors — 0; независимый reviewer — без замечаний.
Коммит: feature/night-shift-refactor / feat: ИСП.: Кнопки обзор в моих проектах / 896481c.

## PRI-133 | Повторная проверка кнопок создания и добавления
Старт: 2026-11-15 01:16 +03:00
Окончание: 2026-11-15 01:33 +03:00
Статус: Review
Изменения: Customer по-прежнему открывает создание заказа, Executor — добавление кандидата. Applicant CTA переименована в «Найти вакансию» и ведёт к существующему списку вакансий; неподдерживаемая локальная форма отдельного Applicant-резюме больше не открывается этим действием.
Ошибки/ограничения: backend не поддерживает самостоятельное Applicant-резюме. Безопасный Applicant путь — отклик на конкретную опубликованную вакансию через Applicant-only endpoint; реальную отправку отклика в этом UI-прогоне не выполнял.
Проверка: `useWorkspaceUiActions.test.ts` + `workspaceShell.helpers.test.ts` — 13/13; `npm run build` — success (2016 modules); ESLint затронутых файлов и `git diff --check` — success; Playwright 1.65.1 + Edge fixtures подтвердил CTA, переход на активную вкладку вакансий, доступность тестовой вакансии, отсутствие формы ложного резюме, page errors — 0.
Коммит: feature/night-shift-refactor / feat: перепроверить кнопки создания/добавления / 3b9e7c6.

## PRI-132 | Индикатор роли и переключение Applicant/Executor
Старт: 2026-11-15 01:33 +03:00
Окончание: 2026-11-15 01:47 +03:00
Статус: Review
Изменения: яркий role pill под профилем уже переключал Applicant↔Executor на desktop; исправлен mobile-вариант, который скрывал название роли и оставлял одну иконку. На ширине до 900 px теперь видны роль и стрелки; accessible name сообщает текущую роль.
Ошибки/ограничения: реальную смену роли на пользовательской backend-сессии не выполнял. Существующая controller/backend логика поддерживает оба направления; frontend fixture проверил отображение обоих ролей, а backend integration coverage содержит переход Applicant→Executor.
Проверка: Playwright 1.65.1 + Edge fixtures для Applicant и Executor при 1365×900, 390×844 и 320×844: подписи видны, overflow нет, page errors — 0; ESLint `Header.tsx`, `npm run build` (2016 modules) и `git diff --check` успешны.
Коммит: feature/night-shift-refactor / feat: добавить яркий переключатель роли / 022c1ba.

## PRI-131 | Покупка кандидатов и комментарии
Старт: 2026-11-15 01:50 +03:00 (точная отметка начала не сохранилась)
Окончание: 2026-11-15 02:05 +03:00
Статус: Blocked — нужна продуктовая спецификация покупки и доступа к комментариям.
Изменения: удалены session-only `purchasedCandidateIds`, локальный success handler и фильтрация «купленных» кандидатов; в деталях кандидата больше нет кнопки покупки и выдаваемых за recruiter comments значений из `WorkspaceCandidate.comment`. Собственные кандидаты по `isOwnedByRequester` сохранены. Панель сообщает, что покупка/комментарии недоступны.
Ограничения: backend не имеет purchase/unlock API, персистентности покупки и источника закрытых комментариев. Нельзя безопасно выбрать цену, плательщика, payment flow, срок/область прав, возвраты и видимость комментариев без доменных правил. Контактный TTL не используется как замена покупки. Реальный billing flow не проверялся.
Проверка: новый `CandidateDetailsPagePanel.test.tsx` и `workspaceShell.helpers.test.ts` — 11/11; полный frontend suite — 80/80; `npm exec -- eslint` для всех затронутых TS/TSX-файлов — без замечаний; `npm run build` — success, 2016 modules; reviewer — замечаний нет; `git diff --check`.
YouGile: PRI-131 переведена в Blocked с описанием отсутствующего бизнес-контракта; задача не помечена завершённой.
Коммит: feature/night-shift-refactor / fix(workspace): remove fake candidate purchase / 6f5947d.

## MagicPath | Первый сценарий «Кандидаты»
Старт: 2026-11-15 17:12 +03:00
Окончание: 2026-11-15 19:48 +03:00
Статус: Completed
Изменения: добавлена страница добавления кандидата с тремя источниками, рабочий и отправленный заказчику списки, подтверждаемое удаление с серверными ограничениями, numeric experience и русское склонение. Отправленный список защищён от дальнейших изменений; исправлены обновление даты отправки в RTK Query и гонка удаления вакансии с отправкой списка.
Проверка: `npm run tokens:build` и `npm run build` — успешно (2025 modules; предупреждения о размере bundle и устаревшем Browserslist); `npm run lint` — 0 ошибок, 5 предупреждений в нетронутых файлах; `npm run test:run` — 20 файлов, 95/95; `dotnet build backend/IntegrationTests/IntegrationTests.csproj` — 0 предупреждений и ошибок; `git diff --check` — успешно. Playwright Edge: `/app` перенаправлен на `/auth` при 1440x900 и 390x844, горизонтального переполнения нет; кабинет кандидатов не проверен в браузере без авторизованной сессии.
Ограничения: интеграционный запуск на одноразовой PostgreSQL остановлен до тестов с Win32Exception Access Denied в `testhost`; контейнер удалён, Development-БД не затронута. `npm ci` сообщил о 24 уязвимостях lock-файла (1 low, 12 moderate, 11 high). ZIP-архив MagicPath сохранён вне коммита.
Коммит реализации: `76f4e53` (`feat(candidates): integrate MagicPath workflow`).

## MagicPath | UI исполнителя и live-проверка
Старт: 2026-11-16 00:02 +03:00 (первый браузерный проход текущего продолжения)
Окончание: 2026-11-16 00:12 +03:00
Статус: Completed.
Изменения: пересобран и пересоздан только frontend-контейнер; общий Tiptap-редактор настроен без дублирующего Underline в StarterKit, toolbar сохранил отдельное расширение. Данные тестового проекта не менялись.
Проверка: `npm run test:run` — 22 файла, 106/106; `npm run build` — успешно, 2025 модулей; `npm run lint` — 0 ошибок, 5 Fast Refresh предупреждений в AuthFields.tsx и ResumeLinksInput.tsx; reviewer — без замечаний. Docker: frontend healthy, `GET /app` — 200, API-запросы кабинета — 200. Playwright: Executor dashboard и форма добавления кандидата при 1280×900; мобильный viewport 390×844, горизонтального переполнения нет; вкладки источников доступны; после исправления в консоли 0 ошибок и предупреждений.
Ограничения: сборка сообщает об устаревшей базе Browserslist и JS chunk больше 500 kB; не относятся к переносу UI. ZIP-архив MagicPath оставлен untracked как входной файл.
Коммит реализации: `6fd4edc` (`feat(dashboard): finish executor workspace UI`).

## Подготовка продолжения работы на ноутбуке
Старт: 2026-11-21 11:50 +03:00
Окончание: 2026-11-21 11:58 +03:00
Статус: Done
Изменения: добавлена `docs/CONTINUE_ON_LAPTOP.md` с переносом ветки через GitHub или Git bundle, установкой проектного Codex-навыка и пояснением, что глобальные навыки, подключения и секреты не входят в репозиторий. В коммит включено текущее состояние проекта, в том числе новые файлы и удаления из рабочей копии.
Ошибки/заметки: reviewer попросил явно выбрать ветку при клонировании Git bundle; команда исправлена. Сборки и тесты не запускались: в этой задаче зафиксированы имеющиеся изменения и добавлена памятка, функциональность приложения не менялась.
Проверка: `git diff --check` — успешно.
Коммит: `feature/night-shift-refactor` / `feat: подготовить проект к работе с ноутбука` (HEAD).

## Команды MCP для продолжения на ноутбуке
Старт: 2026-11-21 12:25 +03:00
Окончание: 2026-11-21 12:34 +03:00
Статус: Done
Изменения: `docs/CONTINUE_ON_LAPTOP.md` дополнен командами регистрации текущих Codex MCP, установкой глобального DotNetDevMCP tool, настройкой CodeXRay project index, авторизацией Tella и безопасным вводом ключа YouGile. Отдельно перечислены встроенные Codex runtime и платформенные интеграции без CLI-команд.
Ошибки/заметки: установка AI Memory и Caveman требует их локального сервиса/пакета; текущая Codex-конфигурация содержит только endpoint/путь, поэтому в инструкции даны регистрационные команды и это ограничение.
Проверка: `codex mcp list/get` и `codex mcp add/login --help` сверены с установленной CLI; CodeXRay `init/index --help` сверены; официальный Codex MCP quickstart добавлен ссылкой; `git diff --check` — успешно; reviewer — без замечаний. Сборка и тесты не запускались: изменены только инструкции.
Коммит: `feature/night-shift-refactor` / `docs: перечислить MCP-команды для ноутбука` (HEAD).
## HTML-макет | Биржа проектов исполнителя
Старт: 2026-11-26 16:54 +03:00
Окончание: 2026-11-26 21:59 +03:00
Статус: Completed, передано на Review
YouGile: Frontend Delivery `1a2881b6-aa37-4216-b239-6a63370aa3de`, Backend Delivery `d92b3313-3a48-402f-b8a6-a37fa99c1377`.
Источник: `docs/pages/SelectProfi_Project_Exchange (2).html` (входной файл пользователя, не добавлять в коммит автоматически).
Изменения: экран биржи исполнителя с общей навигацией, лентой/таблицей, серверным поиском и фильтрами, сортировкой, постраничной загрузкой, деталями, избранным и откликами. Во вкладке «Все проекты» показываются только доступные активные проекты; экран исполнителя в остальных разделах сохраняет прежний состав заказов. Добавлены сообщение собственного отклика, фильтр и сортировка по сумме после комиссии, а также данные о формате работы, зарплате кандидата, сроке подбора и гарантии. Бизнес-правила условий проверяются при создании и изменении проекта. Миграция `20261126141601_AddProjectExchangeTerms` добавляет nullable-поля, текст отклика и таблицу избранного; удалённый макет оставлен вне коммита.
Проверка: `npm run build` — успешно (предупреждения Browserslist и размера JS-файла); целевые тесты фронтенда — 56/56; два целевых теста прав доступа — 2/2; сборки API и IntegrationTests через DotNetDevMCP — успешно, 0 предупреждений и ошибок; `git diff --check` — успешно. После запуска Docker пересобран и обновлён только frontend; биржа открывается, на viewport 390×844 горизонтального переполнения нет, после обновления сессии ошибок в консоли нет.
Docker-проверка 2026-11-26: frontend отображает новую страницу, но запущенный API остаётся образом от 2026-11-18 и не возвращает `totalCount`; поэтому новая биржа пока показывает ноль результатов. В базе последняя применённая миграция — `20260713154948_AddCandidateResumeSpecializationAndAttachments`, ожидают применения 10 миграций, включая `20261126141601_AddProjectExchangeTerms`. API вызывает `Database.MigrateAsync()` при старте, поэтому новый образ API пока не запускался и база не менялась.
Ограничения: до проверки данных и условий применения 10 ожидающих миграций API не перезапускать; среди них есть backfill ставки 15% для назначенных заказов без сохранённой ставки. Итоговый независимый review агент не завершил из-за лимита инструмента; предыдущие замечания исправлены и проверены сборками и целевыми тестами. Ссылка на макет: локальный файл пользователя, не включать в коммиты.
Коммиты: `472710d` (`feat: Перенести биржу проектов из HTML-макета в кабинет исполнителя`); `89f7f65` (`feat: Обеспечить данные и действия для биржи проектов`).

## Визуальная сверка биржи проектов с HTML-макетом
Старт: 2026-11-26 23:09 +03:00
Окончание: 2026-11-26 23:38 +03:00
Статус: Готово к просмотру заказчиком; другие вкладки не начинались.
Изменения: убрана повторная шапка «Проекты»; биржа растянута по рабочей области, фильтры и панель результатов приведены к компактной компоновке макета. Подписи и порядок пунктов меню исполнителя согласованы с макетом. Поиск по городу объединён с поисковой строкой: сервер уже ищет введённые слова в названии, компании, локации и номере заказа. Сохранены избранное, отклики, лента/таблица, сортировка и выбор размера страницы.
Проверка: docker compose build frontend — успешно (включает tsc и production-сборку); обновлён только frontend-контейнер. Playwright: визуальная сверка при 1440×900; переключение вкладки «Избранное» и вида «Таблица», изменение размера страницы до 100 с видимым контролом; при 390×844 горизонтального переполнения нет. Review: два замечания про доступность разворачивания меню и пропадающий выбор размера страницы исправлены; финальный reviewer подтвердил их закрытие. Данные проектов на контрольном экране не отобразились: API ответил 401, поэтому карточки на странице проверить нельзя. API-контейнер и базу не перезапускал: ожидают применения миграции, включая backfill, риск описан в предыдущей записи.
Коммит: 7a58637 (feat: Сверить биржу проектов с макетом).

## HTML-макет | База кандидатов исполнителя
Старт: 2026-11-26 20:39 +03:00
Окончание: 2026-11-27 00:26 +03:00
Статус: Реализация готова, передана на Review.
YouGile: Frontend Delivery `16919d36-f290-44c8-8c3f-965f20a511a7` (PRI-167).
Источник: `docs/pages/SelectProfi_Project_Exchange (2).html` (входной файл пользователя, не добавлять в коммит автоматически).
Изменения: база кандидатов получила отдельный заголовок и хлебные крошки, фильтры слева, поисковую строку и вертикальный список карточек. Доступны поиск по псевдониму/имени и источнику, фильтры по источнику, этапу и доступному числу лет опыта; есть счётчик результатов, понятное пустое состояние, сброс фильтров и открытие карточки кандидата. Макетные город, навыки, зарплатные ожидания, доступность и контакты не добавлялись: текущий API их не предоставляет, а правила публикации этих персональных данных не заданы. Используются только поля уже разрешённого ответа базы, включая псевдоним и опыт.
Проверка: `npm run test:run` — 22 файла, 116/116; `npm run build` и ESLint изменённых компонентов — успешно; `git diff --check` — успешно. Playwright/Docker: пересобран и заменён только frontend-контейнер; сверка с HTML-макетом при 1440×900, на 390×844 меню фильтров и список складываются в одну колонку, горизонтального переполнения нет. Проверены поиск, пустой результат по фильтру этапа и восстановление карточек кнопкой сброса. API в открытой тестовой сессии отвечает 401; живой ответ базы проверить не удалось, браузер показывал сохранённые тестовые данные. Reviewer — существенных замечаний нет.
Ограничения: макетные поля, которых нет в API и с правилами доступа, требуют отдельного контракта видимости/согласия; текущий экран не раскрывает их фиктивными значениями. В production-сборке остаются предупреждения об устаревшей базе Browserslist и размере JS chunk.
Коммит: `feature/night-shift-refactor` / `feat: Перенести базу кандидатов из HTML-макета` (`299e747`).
