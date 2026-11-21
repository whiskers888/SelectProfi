# SelectProfi MagicPath — справочник по выгрузке

Это экспорт интерактивного прототипа SelectProfi. Здесь сохранён внешний вид MagicPath и демо-поведение, но это не production-код и не проект для запуска вместо рабочего SelectProfi.

- `src/components/generated/SelectProfi.tsx` — React-оболочка и HTML-строка `originalMarkup`.
- `src/components/generated/SelectProfiLegacy.css` — исходный CSS, включая перекрывающие предыдущие правила в конце файла.
- `src/components/generated/SelectProfiLegacy.js` — данные и логика демо, функции `renderPoolV3`, `renderAddCandidateV5`, `renderResponsesV4`, `renderJobV4` и др.
- `src/App.tsx`, `src/main.tsx`, `package.json` — относятся только к standalone предпросмотру; не импортировать поверх рабочих файлов.

Текущая выгрузка содержит страницу добавления кандидатов, отклики, «Мою вакансию», документы, оплаты и историю. В этой выгрузке отсутствуют **отдельная кнопка удаления кандидата** и единая функция склонения стажа — их нужно реализовать при интеграции.

Пользовательский UI не должен возвращаться к формулировке «шорт-лист»: использовать «список кандидатов». При этом внутренние DTO/API могут использовать `Shortlist` ради сохранения контрактов.

Подробный план — в `INTEGRATION_INTO_EXISTING_PROJECT.md`.
