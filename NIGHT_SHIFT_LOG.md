
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
Коммит: feature/night-shift-refactor / feat: NS-03 политика псевдонимов кандидатов для заказчика.

