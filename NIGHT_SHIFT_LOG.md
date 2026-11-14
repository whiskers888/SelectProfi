
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
Коммит: feature/night-shift-refactor / feat: NS-07 | Dashboard заказчика: escrow и безопасный shortlist / pending.
