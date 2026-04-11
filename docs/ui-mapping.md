# UI Mapping (MVP)

## Источники

- `backend/Api/Contracts/Orders/CreateOrderRequest.cs`
- `backend/Api/Contracts/Vacancies/CreateVacancyRequest.cs`
- `backend/Api/Contracts/Vacancies/CreateCandidateResumeRequest.cs`
- `frontend/src/features/orders/ui/OrdersCreateSurface.tsx`
- `frontend/src/features/vacancies/ui/VacancyPipelineSurface.tsx`

## Create Order

- Endpoint: `POST /api/orders`
- Body:
  - `title: string` (required, 1..200)
  - `description: string` (required, 1..4000)
- Front status:
  - Форма уже соответствует контракту по полям.
  - `description` сейчас рендерится как `Input`, для длинного текста лучше перевести на `Textarea`.

## Create Vacancy

- Endpoint: `POST /api/vacancies`
- Body:
  - `orderId: guid` (required)
  - `title: string` (required, 1..200)
  - `description: string` (required, 1..4000)
- Front status:
  - Контракт уже покрыт: `orderId` берется из выбранного заказа, `title/description` заполняются в форме.
  - Для UX стоит перейти от compact-полей к page-form (без modal).

## Create Candidate Resume

- Endpoint: `POST /api/vacancies/{vacancyId}/candidates/resumes`
- Body:
  - `fullName: string` (required, 1..200)
  - `birthDate?: string (DateOnly, YYYY-MM-DD)`
  - `email?: string` (email, max 254)
  - `phone?: string` (max 32)
  - `specialization: string` (required, 1..120)
  - `resumeTitle: string` (required, 1..200)
  - `resumeContentJson: string` (required, min 1)
  - `resumeAttachmentsJson?: string`
- Front status:
  - Прямого JSON-редактора нет: `resumeContentJson` собирается из `resumeSummary/resumeSkills` в `useVacancyPipelineActions`.
  - Вложения передаются как JSON-строка ссылок через `resumeAttachmentLinks`.
  - Текущая форма функционально работает с API, но не покрывает rich-text UX и upload-файлов.

## Зафиксированные gap для следующих шагов

1. Перенос create-форм из modal/compact-блоков в отдельные page-sections внутри текущего layout (sidebar + header).
2. Добавление rich-text editor для `resumeContentJson` с хранением валидного JSON на отправке.
3. Добавление режима вложений:
   - минимум: поля ссылок на облако;
   - расширение: upload + сохранение ссылок/метаданных в `resumeAttachmentsJson`.
4. Приведение полей и валидации форм к backend-ограничениям (`maxLength`, required, формат даты/email).
