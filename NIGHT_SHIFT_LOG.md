
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
Коммит: feature/night-shift-refactor / feat: NS-01 модели Wallet и Notification, миграция и seed.

