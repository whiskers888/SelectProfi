# Frontend API Contracts (Baseline)

Дата актуализации: **31 марта 2026**  
Источник: текущий код frontend (`React + RTK Query`)

## 1. Область покрытия

Документ описывает **контракты API, которые фактически использует активный роутинг frontend**:

- `/login` -> `LoginPage`
- `/register` -> `RegisterPage`
- `/dashboard` -> `DashboardPage`
- `/profile` -> `ProfilePage`

Не входит в обязательный runtime-контур:

- `AuthPage.tsx` (legacy-страница, сейчас не подключена в роутер)

## 2. Транспорт и общие правила

## 2.1 Режим API

Frontend поддерживает два режима:

- `VITE_API_MODE=server` -> реальные HTTP-запросы в backend.
- `VITE_API_MODE=mock` -> in-memory mock API во frontend.

См.:

- `frontend/src/shared/config/apiMode.ts`
- `frontend/src/shared/api/emptyApi.ts`
- `frontend/.env.example`
- `frontend/.env.mock`
- `frontend/.env.server`

## 2.2 Базовый URL

- `VITE_API_BASE_URL` (если не задан):
  - в `test`: `http://localhost:5268`
  - в обычном dev/build: `/` (дальше работает Vite proxy для `/api`, `/health`, `/openapi`)

## 2.3 Авторизация и reauth

- В сторе/локальном хранилище хранится сессия:
  - `accessToken: string`
  - `refreshToken: string`
- Ключ localStorage: `selectprofi.auth.session`
- Во все запросы автоматически добавляется:
  - `Authorization: Bearer <accessToken>` (если accessToken есть)
- При `401` на любом endpoint, кроме `/api/auth/refresh`, frontend делает `POST /api/auth/refresh`:
  - body: `{ refreshToken }`
  - при успехе: ретрай исходного запроса
  - при провале: сессия очищается

## 3. Endpoint contracts

## 3.1 `POST /api/auth/register`

Где используется:

- `RegisterPage.tsx` (мутация `useRegisterUserMutation`)

Request body (что отправляет frontend):

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "Customer | Executor | Applicant"
}
```

Примечания:

- В UI есть поле `company`, но в API payload оно **не отправляется**.
- `fullName` в UI делится на `firstName` + `lastName`.

Frontend pre-validation:

- `fullName` обязательно, минимум имя + фамилия.
- `email` обязателен, базовый email-regex.
- `phone` обязателен.
- `password` обязателен, минимум 8 символов.
- `role` обязателен.

Success response (ожидается):

```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

Error contract, который frontend умеет парсить:

- `400`: validation style
  - `errors` как объект `field -> string[]`
- `409`: conflict style
  - `errors` как массив объектов `{ field: string, message: string }`
- также используются `title`/`detail` для общего сообщения формы.

Рабочий набор полей ошибок для маппинга:

- `company`, `email`, `firstName`, `fullName`, `lastName`, `password`, `phone`, `role`

Комментарии для задач:

- [ ] Уточнить backend-правила валидации по `phone`.
- [ ] Решить, нужен ли `company` в register API.

---

## 3.2 `POST /api/auth/login`

Где используется:

- `LoginPage.tsx` (мутация `useLoginUserMutation`)

Request body:

```json
{
  "email": "string",
  "password": "string"
}
```

Frontend pre-validation:

- `email` обязателен, базовый email-regex.
- `password` обязателен.

Success response:

```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

Error contract:

- `400`: `errors` объект `field -> string[]` (поля `email`, `password`)
- `401`: фронт покажет `detail/title` как form-level ошибку

Комментарии для задач:

- [ ] Зафиксировать единый текст `detail` для `401`.

---

## 3.3 `POST /api/auth/refresh`

Где используется:

- `AuthSessionBootstrap.tsx`
- авто-reauth из `emptyApi.ts`

Request body:

```json
{
  "refreshToken": "string"
}
```

Success response:

```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

Поведение при ошибке:

- если refresh вернул `401`/ошибку -> frontend очищает auth session.

Комментарии для задач:

- [ ] Уточнить SLA/TTL для refresh-токена.

---

## 3.4 `GET /api/profile/me`

Где используется:

- `ProfilePage.tsx` (`useGetMyProfileQuery`)

Authorization:

- обязателен `Bearer accessToken`

Response shape (ожидается frontend):

```json
{
  "userId": "string",
  "email": "string",
  "phone": "string | null",
  "firstName": "string",
  "lastName": "string",
  "role": "Applicant | Executor | Customer | Admin",
  "isEmailVerified": true,
  "isPhoneVerified": true,
  "applicantProfile": { "...": "..." } | null,
  "customerProfile": { "...": "..." } | null,
  "executorProfile": { "...": "..." } | null
}
```

Role-specific objects:

- `applicantProfile`:
  - `resumeTitle`, `previousCompanyName`, `workPeriod`, `experienceSummary`,
    `achievements`, `education`, `skills[]`, `certificates[]`,
    `portfolioUrl`, `about`, `desiredSalary`
- `customerProfile`:
  - `inn`, `egrn`, `egrnip`, `companyName`, `companyLogoUrl`
- `executorProfile`:
  - `employmentType` (`Fl | Smz | Ip`), `projectTitle`, `projectCompanyName`,
    `experienceSummary`, `achievements`, `certificates[]`, `grade`, `extraInfo`

Комментарии для задач:

- [ ] Зафиксировать nullable-политику для каждого поля в role-profile.

---

## 3.5 `PUT /api/profile/me`

Где используется:

- `ProfilePage.tsx` (`useUpdateMyProfileMutation`)

Authorization:

- обязателен `Bearer accessToken`

Base payload (всегда):

```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string | undefined"
}
```

Дальше добавляется **ровно один** role-specific блок по текущей роли пользователя.

`Applicant`:

```json
{
  "applicantProfile": {
    "resumeTitle": "string | undefined",
    "previousCompanyName": "string | undefined",
    "workPeriod": "string | undefined",
    "experienceSummary": "string | undefined",
    "achievements": "string | undefined",
    "education": "string | undefined",
    "skills": ["string"] | undefined,
    "certificates": ["string"] | undefined,
    "portfolioUrl": "string | undefined",
    "about": "string | undefined",
    "desiredSalary": 12345 | undefined
  }
}
```

`Customer`:

```json
{
  "customerProfile": {
    "inn": "string | undefined",
    "egrn": "string | undefined",
    "egrnip": "string | undefined",
    "companyName": "string | undefined",
    "companyLogoUrl": "string | undefined"
  }
}
```

`Executor`:

```json
{
  "executorProfile": {
    "employmentType": "Fl | Smz | Ip",
    "projectTitle": "string | undefined",
    "projectCompanyName": "string | undefined",
    "experienceSummary": "string | undefined",
    "achievements": "string | undefined",
    "certificates": ["string"] | undefined,
    "grade": "string | undefined",
    "extraInfo": "string | undefined"
  }
}
```

Frontend pre-validation:

- Общая форма:
  - `firstName` обязателен
  - `lastName` обязателен
  - `phone` (если указан) должен быть в формате `+79991234567`
- Applicant:
  - `desiredSalary` (если указан) — число, до 2 знаков после точки, >= 0
- Executor:
  - `employmentType` обязателен

Success response:

- frontend ожидает полный актуальный `MyProfileResponse` (как в `GET /api/profile/me`)

Error contract:

- frontend читает `status`, `title`, `detail`
- отдельный маппинг полей ошибок тут не используется (показывается form-level сообщение)

Комментарии для задач:

- [ ] Согласовать merge-логику: что делать с не-переданными role-profile полями.
- [ ] Явно задокументировать max-length и форматы для URL/ИНН/ЕГРН.

---

## 3.6 `GET /health`

Где используется:

- `DashboardPage.tsx` (`useGetHealthQuery`)

Контракт:

- frontend фактически использует только сам факт `200` vs error:
  - `200` -> "Сервис доступен"
  - error -> "Ошибка соединения"

Тело ответа сейчас не критично (тип в generated API = `unknown`).

Комментарии для задач:

- [ ] Зафиксировать финальный health payload (например `status`, `version`, `timestamp`).

## 4. Формат ошибок, который фронт точно понимает

Рекомендуемый Problem Details envelope:

```json
{
  "title": "string",
  "detail": "string",
  "errors": {}
}
```

Поддерживаемые варианты `errors`:

- object: `{ "fieldName": ["msg1", "msg2"] }`
- array (для 409 register): `[ { "field": "email", "message": "..." } ]`

## 5. Mock API (для автономной работы фронта)

В `mock` режиме реализованы:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `GET /api/profile/me`
- `PUT /api/profile/me`
- `GET /health`

Seed users (mock):

- `customer@selectprofi.local` / `1`
- `executor@selectprofi.local` / `1`
- `applicant@selectprofi.local` / `1`

## 6. Шаблон для разбиения по задачам

Для каждого endpoint можно вынести отдельный markdown-файл по шаблону:

```md
# <METHOD> <PATH>
## Использование во фронте
## Request contract
## Response contract
## Validation/UX expectations
## Error contract
## Open questions
- [ ]
```

