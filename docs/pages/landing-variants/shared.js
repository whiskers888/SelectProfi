// Shared mock content for the landing-page variants (prototype only, not wired to the API).
// Candidate names respect the contacts rule: without access the customer sees an alias
// "Adjective + Specialization" instead of a full name.

window.SP = {
  roles: {
    Customer: {
      label: 'Заказчик',
      user: 'Ирина Котова',
      company: 'ООО «Альфа Логистик»',
      nav: ['Мои заказы', 'Кандидаты', 'Встречи', 'Чаты', 'Документы'],
      greeting: 'Двое кандидатов ждут вашего решения',
      primaryAction: 'Создать заказ',
      stats: [
        { key: 'orders', label: 'Заказов в работе', value: '3', note: '1 ждёт назначения исполнителя' },
        { key: 'review', label: 'На вашем решении', value: '2', note: 'по вакансии «Senior React»' },
        { key: 'new', label: 'Новых кандидатов', value: '4', note: 'за последние 7 дней' },
        { key: 'reserved', label: 'Зарезервировано', value: '360 000 ₽', note: 'остаток 140 000 ₽' },
      ],
      todo: [
        { tag: 'Решение', text: 'Выбрать финалиста по «Senior React-разработчик»', meta: 'Shortlist: 3 кандидата', urgent: true },
        { tag: 'Согласование', text: 'Проверить описание вакансии «Бухгалтер на первичку»', meta: 'Прислал исполнитель вчера' },
        { tag: 'Встреча', text: 'Интервью с «Внимательный Frontend»', meta: 'Сегодня, 15:00' },
        { tag: 'Исполнитель', text: 'Выбрать исполнителя на «Product Designer»', meta: '4 отклика рекрутеров' },
      ],
      list: {
        title: 'Заказы',
        columns: ['Вакансия', 'Исполнитель', 'Этап', 'Кандидаты', 'Бюджет'],
        rows: [
          ['Senior React-разработчик', 'Анна Ершова', 'Shortlist', '3 / 3', '120 000 ₽'],
          ['Бухгалтер на первичку', 'Олег Мирный', 'Согласование вакансии', '0 / 3', '60 000 ₽'],
          ['Менеджер по продажам B2B', 'Анна Ершова', 'Pool', '5 / 3', '90 000 ₽'],
          ['Product Designer', '—', 'Выбор исполнителя', '—', '90 000 ₽'],
        ],
        status: ['ok', 'warn', 'ok', 'idle'],
      },
      people: {
        title: 'Финалисты «Senior React»',
        items: [
          { name: 'Внимательный Frontend', sub: '6 лет, React, TypeScript', stage: 'Shortlist' },
          { name: 'Системный Frontend', sub: '4 года, React, Next.js', stage: 'Shortlist' },
          { name: 'Аккуратный Frontend', sub: '5 лет, Vue → React', stage: 'Shortlist' },
        ],
      },
      pipeline: [
        { stage: 'Pool', count: 8 },
        { stage: 'Shortlist', count: 3 },
        { stage: 'Выбран', count: 0 },
      ],
      timeline: [
        { time: '09:40', text: 'Анна Ершова добавила 2 кандидатов в Shortlist «Senior React»' },
        { time: 'Вчера', text: 'Олег Мирный отправил вакансию «Бухгалтер» на согласование' },
        { time: 'Пн', text: '4 рекрутера откликнулись на заказ «Product Designer»' },
        { time: 'Пт', text: 'Заказ «Менеджер по продажам B2B» опубликован' },
      ],
    },
    Executor: {
      label: 'Исполнитель',
      user: 'Анна Ершова',
      company: 'Рекрутер, самозанятая',
      nav: ['Мои проекты', 'Биржа проектов', 'Кандидаты', 'Встречи', 'Чаты', 'Аналитика'],
      greeting: 'Сегодня: 2 интервью и одна вакансия на согласовании',
      primaryAction: 'Добавить кандидата',
      stats: [
        { key: 'projects', label: 'Проектов в работе', value: '3', note: '1 на согласовании' },
        { key: 'pipeline', label: 'Кандидатов в работе', value: '12', note: 'отклики и ваши кандидаты' },
        { key: 'shortlist', label: 'Финалистов', value: '4', note: 'отправлено заказчикам' },
        { key: 'income', label: 'К получению', value: '255 000 ₽', note: 'после комиссии 15%' },
      ],
      todo: [
        { tag: 'Shortlist', text: 'Добрать 1 кандидата в Shortlist «Менеджер B2B»', meta: 'Заказчик ждёт 3 финалиста', urgent: true },
        { tag: 'Вакансия', text: 'Доработать описание «Бухгалтер на первичку»', meta: 'Черновик сохранён' },
        { tag: 'Отклики', text: 'Разобрать 5 новых откликов соискателей', meta: '«Senior React»' },
        { tag: 'Биржа', text: '2 новых проекта по вашей специализации', meta: 'Frontend, Design' },
      ],
      list: {
        title: 'Мои проекты',
        columns: ['Проект', 'Компания', 'Этап', 'Кандидаты', 'К получению'],
        rows: [
          ['Senior React-разработчик', 'ООО «Альфа Логистик»', 'Shortlist', '3 / 3', '102 000 ₽'],
          ['Менеджер по продажам B2B', 'ООО «Вектор»', 'Pool', '2 / 3', '76 500 ₽'],
          ['Бухгалтер на первичку', 'ИП Смирнова', 'Вакансия на согласовании', '0 / 3', '76 500 ₽'],
        ],
        status: ['ok', 'warn', 'idle'],
      },
      people: {
        title: 'Кандидаты в работе',
        items: [
          { name: 'Иван Петров', sub: 'Frontend, 6 лет', stage: 'Shortlist' },
          { name: 'Мария Соколова', sub: 'Продажи B2B, 4 года', stage: 'Pool' },
          { name: 'Алексей Ким', sub: 'Frontend, 5 лет', stage: 'Shortlist' },
          { name: 'Ольга Белова', sub: 'Продажи B2B, 7 лет', stage: 'Pool' },
        ],
      },
      pipeline: [
        { stage: 'Pool', count: 8 },
        { stage: 'Shortlist', count: 4 },
        { stage: 'Выбран', count: 1 },
      ],
      timeline: [
        { time: '10:15', text: 'Заказчик открыл резюме «Иван Петров»' },
        { time: '09:02', text: 'Новый отклик соискателя на «Senior React»' },
        { time: 'Вчера', text: 'Вы отправили вакансию «Бухгалтер» на согласование' },
        { time: 'Пн', text: 'Вас назначили исполнителем на «Менеджер по продажам B2B»' },
      ],
    },
    Applicant: {
      label: 'Соискатель',
      user: 'Дмитрий Орлов',
      company: 'Frontend-разработчик',
      nav: ['Мои отклики', 'База вакансий', 'Мои резюме', 'Встречи', 'Чаты'],
      greeting: 'Вас пригласили на интервью',
      primaryAction: 'Добавить резюме',
      stats: [
        { key: 'responses', label: 'Отправлено откликов', value: '5', note: '+1 сегодня' },
        { key: 'invites', label: 'Приглашений', value: '1', note: 'ответьте до пятницы' },
        { key: 'meetings', label: 'Встреч назначено', value: '1', note: 'чт, 12:00' },
        { key: 'views', label: 'Просмотров резюме', value: '14', note: 'за 7 дней' },
      ],
      todo: [
        { tag: 'Приглашение', text: 'Ответить ООО «Альфа Логистик» на приглашение', meta: 'Senior React-разработчик', urgent: true },
        { tag: 'Встреча', text: 'Интервью в четверг, 12:00', meta: 'Ссылка придёт в чат' },
        { tag: 'Резюме', text: 'Добавить ссылку на портфолио', meta: 'Резюме заполнено на 80%' },
        { tag: 'Вакансии', text: '3 новые вакансии по вашим фильтрам', meta: 'Frontend, удалённо' },
      ],
      list: {
        title: 'Мои отклики',
        columns: ['Вакансия', 'Компания', 'График', 'Оплата', 'Статус'],
        rows: [
          ['Senior React-разработчик', 'ООО «Альфа Логистик»', '5/2, гибрид', '250–300 тыс. ₽', 'Приглашение'],
          ['Frontend-разработчик', 'ООО «Вектор»', '5/2, удалённо', 'от 200 тыс. ₽', 'Рассматривают'],
          ['React Native-разработчик', 'АО «Север Digital»', '5/2, офис', '220 тыс. ₽', 'Отправлен'],
        ],
        status: ['ok', 'warn', 'idle'],
      },
      people: {
        title: 'Подходящие вакансии',
        items: [
          { name: 'Frontend Lead', sub: 'ООО «Вектор», удалённо', stage: 'от 320 тыс. ₽' },
          { name: 'Middle React', sub: 'ИП Смирнова, Казань', stage: '180 тыс. ₽' },
          { name: 'Frontend (Vue)', sub: 'АО «Север Digital», гибрид', stage: '210 тыс. ₽' },
        ],
      },
      pipeline: [
        { stage: 'Отправлен', count: 3 },
        { stage: 'Рассматривают', count: 1 },
        { stage: 'Приглашение', count: 1 },
      ],
      timeline: [
        { time: '11:20', text: 'ООО «Альфа Логистик» пригласило вас на интервью' },
        { time: '08:45', text: 'Ваше резюме посмотрели 3 компании' },
        { time: 'Вчера', text: 'Вы откликнулись на «React Native-разработчик»' },
        { time: 'Вт', text: 'Отклик на «Frontend-разработчик» перешёл в «Рассматривают»' },
      ],
    },
  },

  currentRole() {
    const role = new URLSearchParams(location.search).get('role')
    return this.roles[role] ? role : 'Customer'
  },

  // Renders the role switcher into #role-switch and calls render(roleKey, data).
  mount(render) {
    const roleKey = this.currentRole()
    const host = document.getElementById('role-switch')
    if (host) {
      host.innerHTML = Object.entries(this.roles)
        .map(([key, r]) => `<a href="?role=${key}" ${key === roleKey ? 'aria-current="page"' : ''}>${r.label}</a>`)
        .join('')
    }
    render(roleKey, this.roles[roleKey])
  },

  initials(name) {
    return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  },
}
