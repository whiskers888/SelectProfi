export type PreviewRole = 'Customer' | 'Executor' | 'Applicant'

export type PreviewView = 'dashboard' | 'orders' | 'candidates' | 'meetings' | 'chats' | 'analytics'

export type PreviewTone = 'default' | 'success' | 'warning' | 'danger' | 'neutral'

export type PreviewStat = {
  id: string
  label: string
  value: string
  note: string
  tone?: PreviewTone
}

export type PreviewOrder = {
  id: string
  title: string
  company: string
  location: string
  priority: 'high' | 'medium' | 'low'
  responses: number
  statusLabel: string
  statusTone: PreviewTone
  updatedAt: string
}

export type PreviewCandidate = {
  id: string
  name: string
  position: string
  orderId: string
  source: string
  rating: string
  statusLabel: string
  statusTone: PreviewTone
  comment: string
}

export type PreviewMeeting = {
  id: string
  title: string
  owner: string
  slot: string
  statusLabel: string
  statusTone: PreviewTone
  linkLabel: string
}

export type PreviewActivity = {
  id: string
  title: string
  description: string
  time: string
  tone: PreviewTone
}

export type PreviewPipelineStage = {
  id: string
  label: string
  count: number
  delta: string
  tone: PreviewTone
}

export type PreviewChatMessage = {
  id: string
  author: 'me' | 'other'
  text: string
  time: string
}

export type PreviewChatThread = {
  id: string
  participant: string
  preview: string
  unread: number
  messages: PreviewChatMessage[]
}

export type PreviewDataset = {
  headerSubtitle: string
  stats: PreviewStat[]
  orders: PreviewOrder[]
  candidates: PreviewCandidate[]
  meetings: PreviewMeeting[]
  activity: PreviewActivity[]
  pipeline: PreviewPipelineStage[]
  chats: PreviewChatThread[]
  analyticsError?: string
}

export const previewRoleOptions: Array<{
  description: string
  label: string
  value: PreviewRole
}> = [
  {
    value: 'Customer',
    label: 'Заказчик',
    description: 'Создает вакансии, управляет воронкой и принимает решение по кандидатам.',
  },
  {
    value: 'Executor',
    label: 'Исполнитель',
    description: 'Ведет подбор кандидатов, обновляет short-list и координирует интервью.',
  },
  {
    value: 'Applicant',
    label: 'Соискатель',
    description: 'Следит за статусом откликов и коммуникацией по выбранным вакансиям.',
  },
]

export const previewViewOptions: Array<{
  label: string
  value: PreviewView
}> = [
  { value: 'dashboard', label: 'Дашборд' },
  { value: 'orders', label: 'Заказы' },
  { value: 'candidates', label: 'Кандидаты' },
  { value: 'meetings', label: 'Встречи' },
  { value: 'chats', label: 'Чаты' },
  { value: 'analytics', label: 'Аналитика' },
]

const customerData: PreviewDataset = {
  headerSubtitle: 'Контур управления подбором по активным вакансиям',
  stats: [
    {
      id: 'active-orders',
      label: 'Активные заказы',
      value: '9',
      note: '3 с высоким приоритетом',
      tone: 'default',
    },
    {
      id: 'new-responses',
      label: 'Новые отклики',
      value: '18',
      note: '7 за последние 24 часа',
      tone: 'warning',
    },
    {
      id: 'scheduled-interviews',
      label: 'Назначенные интервью',
      value: '6',
      note: '4 подтверждены',
      tone: 'success',
    },
    {
      id: 'time-to-hire',
      label: 'Средний срок найма',
      value: '16 дн',
      note: 'На 2 дня быстрее, чем в прошлом месяце',
      tone: 'neutral',
    },
  ],
  orders: [
    {
      id: 'ord-101',
      title: 'Frontend Developer (React)',
      company: 'ООО Альфа',
      location: 'Удаленно',
      priority: 'high',
      responses: 8,
      statusLabel: 'В работе',
      statusTone: 'success',
      updatedAt: 'Обновлено 20 мин назад',
    },
    {
      id: 'ord-102',
      title: 'Product Designer (HR Tech)',
      company: 'ООО Альфа',
      location: 'Москва / Гибрид',
      priority: 'medium',
      responses: 5,
      statusLabel: 'Новые отклики',
      statusTone: 'warning',
      updatedAt: 'Обновлено 1 ч назад',
    },
    {
      id: 'ord-103',
      title: 'Head of Sales',
      company: 'АО Омега',
      location: 'Москва / Офис',
      priority: 'low',
      responses: 2,
      statusLabel: 'Пауза',
      statusTone: 'danger',
      updatedAt: 'Обновлено 2 дн назад',
    },
  ],
  candidates: [
    {
      id: 'cand-501',
      name: 'Виктория Самойлова',
      position: 'Senior Data Analyst',
      orderId: 'ord-102',
      source: 'Short-list исполнителя',
      rating: '4.9',
      statusLabel: 'Финальное интервью',
      statusTone: 'success',
      comment: 'Готова к выходу через 2 недели, сильный опыт в SaaS-метриках.',
    },
    {
      id: 'cand-404',
      name: 'Илья Миронов',
      position: 'Senior Backend Developer',
      orderId: 'ord-101',
      source: 'Отклик через платформу',
      rating: '4.8',
      statusLabel: 'Short-list',
      statusTone: 'default',
      comment: 'Сильный highload профиль, интервью назначено на четверг.',
    },
    {
      id: 'cand-221',
      name: 'Кирилл Зотов',
      position: 'Product Designer',
      orderId: 'ord-102',
      source: 'База исполнителя',
      rating: '4.5',
      statusLabel: 'Скрининг',
      statusTone: 'warning',
      comment: 'Подходит по домену, нужен кейс-интервью по UX-исследованиям.',
    },
  ],
  meetings: [
    {
      id: 'meet-1',
      title: 'Интервью: Frontend Developer',
      owner: 'Анна Соколова',
      slot: '31 марта, 16:00-16:45',
      statusLabel: 'Критично',
      statusTone: 'warning',
      linkLabel: 'Открыть Telemost',
    },
    {
      id: 'meet-2',
      title: 'Синк по Product Designer',
      owner: 'Юлия Воронцова',
      slot: 'Сегодня, 18:30-19:00',
      statusLabel: 'Запланировано',
      statusTone: 'default',
      linkLabel: 'Открыть Zoom',
    },
    {
      id: 'meet-3',
      title: 'Kickoff: Data Analyst',
      owner: 'Команда найма',
      slot: '1 апреля, 11:00-11:30',
      statusLabel: 'Подтверждено',
      statusTone: 'success',
      linkLabel: 'Открыть Meet',
    },
  ],
  activity: [
    {
      id: 'act-1',
      title: 'Новый отклик исполнителя по ord-101',
      description: 'Мария Кузнецова отправила shortlist из 2 кандидатов.',
      time: '10 минут назад',
      tone: 'warning',
    },
    {
      id: 'act-2',
      title: 'Интервью подтверждено',
      description: 'Кандидат Виктория Самойлова подтвердила участие во встрече.',
      time: '42 минуты назад',
      tone: 'success',
    },
    {
      id: 'act-3',
      title: 'Чат с исполнителем обновлен',
      description: 'Получен новый комментарий по заказу ord-102.',
      time: '1 час назад',
      tone: 'default',
    },
  ],
  pipeline: [
    { id: 'pipe-1', label: 'Новые отклики', count: 18, delta: '+6', tone: 'warning' },
    { id: 'pipe-2', label: 'Скрининг', count: 11, delta: '+2', tone: 'default' },
    { id: 'pipe-3', label: 'Интервью', count: 6, delta: '+1', tone: 'success' },
    { id: 'pipe-4', label: 'Оффер', count: 2, delta: '0', tone: 'neutral' },
    { id: 'pipe-5', label: 'Отказ', count: 7, delta: '+1', tone: 'danger' },
  ],
  chats: [
    {
      id: 'chat-1',
      participant: 'Анна Соколова (исполнитель)',
      preview: 'Подтвердите слот на завтра 16:00',
      unread: 2,
      messages: [
        {
          id: 'msg-1-1',
          author: 'other',
          text: 'Добрый день! Подтвердите слот на завтра 16:00.',
          time: '14:12',
        },
        {
          id: 'msg-1-2',
          author: 'me',
          text: 'Подтверждаю. Пришлите ссылку на интервью и состав участников.',
          time: '14:16',
        },
      ],
    },
    {
      id: 'chat-2',
      participant: 'Юлия Воронцова (исполнитель)',
      preview: 'Обновила shortlist по Product Designer',
      unread: 0,
      messages: [
        {
          id: 'msg-2-1',
          author: 'other',
          text: 'Обновила shortlist, добавила комментарии по каждому профилю.',
          time: '12:40',
        },
      ],
    },
  ],
  analyticsError:
    'Отчет конверсии временно недоступен. Проверьте соединение с сервисом аналитики и повторите запрос.',
}

const executorData: PreviewDataset = {
  headerSubtitle: 'Рабочее пространство исполнителя и управления кандидатом',
  stats: [
    {
      id: 'projects',
      label: 'Проекты в работе',
      value: '7',
      note: '2 на этапе согласования',
      tone: 'default',
    },
    {
      id: 'pipeline',
      label: 'Кандидаты в пайплайне',
      value: '23',
      note: '5 добавлено сегодня',
      tone: 'warning',
    },
    {
      id: 'shortlist',
      label: 'Отправлено в short-list',
      value: '3',
      note: '1 сегодня',
      tone: 'success',
    },
    {
      id: 'meetings',
      label: 'Назначенные интервью',
      value: '4',
      note: '2 подтверждены заказчиком',
      tone: 'neutral',
    },
  ],
  orders: [
    {
      id: 'ord-201',
      title: 'Frontend Developer (React)',
      company: 'ООО Альфа',
      location: 'Удаленно',
      priority: 'high',
      responses: 5,
      statusLabel: 'Подбор',
      statusTone: 'success',
      updatedAt: 'Обновлено 15 мин назад',
    },
    {
      id: 'ord-202',
      title: 'Data Analyst',
      company: 'FinTech Project',
      location: 'Москва / Гибрид',
      priority: 'medium',
      responses: 4,
      statusLabel: 'Согласование',
      statusTone: 'default',
      updatedAt: 'Обновлено 58 мин назад',
    },
    {
      id: 'ord-203',
      title: 'Product Designer',
      company: 'HR SaaS',
      location: 'Удаленно',
      priority: 'medium',
      responses: 3,
      statusLabel: 'Скрининг',
      statusTone: 'warning',
      updatedAt: 'Обновлено 2 ч назад',
    },
  ],
  candidates: [
    {
      id: 'cand-701',
      name: 'Елена Петрова',
      position: 'Senior Frontend Developer',
      orderId: 'ord-201',
      source: 'Отклик с платформы',
      rating: '4.8',
      statusLabel: 'Short-list',
      statusTone: 'success',
      comment: 'Опыт 8+ лет в B2B, готова к техническому интервью в четверг.',
    },
    {
      id: 'cand-702',
      name: 'Дмитрий Орлов',
      position: 'Backend Developer',
      orderId: 'ord-201',
      source: 'Рекомендация из базы',
      rating: '4.7',
      statusLabel: 'Новый',
      statusTone: 'warning',
      comment: 'Сильный Node.js стек, нужен быстрый первичный скрининг.',
    },
    {
      id: 'cand-703',
      name: 'Виктория Самойлова',
      position: 'Senior Data Analyst',
      orderId: 'ord-202',
      source: 'Передан заказчику',
      rating: '4.9',
      statusLabel: 'Финал',
      statusTone: 'default',
      comment: 'Лучший матч по продуктовой аналитике, заказчик запросил финальный call.',
    },
  ],
  meetings: [
    {
      id: 'meet-11',
      title: 'Скрининг: Елена Петрова',
      owner: 'Иван Петров (заказчик)',
      slot: '31 марта, 14:00-14:45',
      statusLabel: 'Критично',
      statusTone: 'warning',
      linkLabel: 'Открыть Telemost',
    },
    {
      id: 'meet-12',
      title: 'Синк по short-list',
      owner: 'Команда подбора',
      slot: 'Сегодня, 18:30-19:00',
      statusLabel: 'Запланировано',
      statusTone: 'default',
      linkLabel: 'Открыть Meet',
    },
  ],
  activity: [
    {
      id: 'act-11',
      title: 'Заказчик запросил 2 доп. кандидатов',
      description: 'По ord-202 обновился комментарий в задаче.',
      time: '5 минут назад',
      tone: 'warning',
    },
    {
      id: 'act-12',
      title: 'Кандидат подтвердил интервью',
      description: 'Елена Петрова подтвердила слот на 31 марта.',
      time: '27 минут назад',
      tone: 'success',
    },
    {
      id: 'act-13',
      title: 'Обновлен чат по ord-201',
      description: 'В треде появился новый вопрос о формате оффера.',
      time: '1 час назад',
      tone: 'default',
    },
  ],
  pipeline: [
    { id: 'pipe-11', label: 'Новые', count: 11, delta: '+3', tone: 'warning' },
    { id: 'pipe-12', label: 'Скрининг', count: 7, delta: '+1', tone: 'default' },
    { id: 'pipe-13', label: 'Short-list', count: 4, delta: '+2', tone: 'success' },
    { id: 'pipe-14', label: 'Интервью', count: 4, delta: '+1', tone: 'default' },
    { id: 'pipe-15', label: 'Отказ', count: 3, delta: '0', tone: 'danger' },
  ],
  chats: [
    {
      id: 'chat-11',
      participant: 'Иван Петров (заказчик)',
      preview: 'Нужны 2 релевантных кандидата до вечера',
      unread: 1,
      messages: [
        {
          id: 'msg-11-1',
          author: 'other',
          text: 'Нужно добавить 2 профиля в shortlist до 18:00.',
          time: '13:20',
        },
        {
          id: 'msg-11-2',
          author: 'me',
          text: 'Принял. Отправлю обновленный набор кандидатов в течение часа.',
          time: '13:24',
        },
      ],
    },
    {
      id: 'chat-12',
      participant: 'Елена Петрова (кандидат)',
      preview: 'Подтверждаю участие в интервью',
      unread: 0,
      messages: [
        {
          id: 'msg-12-1',
          author: 'other',
          text: 'Подтверждаю участие в интервью. Буду на связи в 14:00.',
          time: '12:02',
        },
      ],
    },
  ],
}

const applicantData: PreviewDataset = {
  headerSubtitle: 'Личный кабинет соискателя SelectProfi',
  stats: [
    {
      id: 'applied',
      label: 'Активные отклики',
      value: '2',
      note: '1 на этапе интервью',
      tone: 'default',
    },
    {
      id: 'messages',
      label: 'Новые сообщения',
      value: '1',
      note: 'Ответ от HR по Backend вакансии',
      tone: 'warning',
    },
    {
      id: 'interviews',
      label: 'Назначенные встречи',
      value: '1',
      note: 'Сегодня в 16:30',
      tone: 'success',
    },
    {
      id: 'offers',
      label: 'Офферы',
      value: '0',
      note: 'Пока нет новых предложений',
      tone: 'neutral',
    },
  ],
  orders: [],
  candidates: [],
  meetings: [
    {
      id: 'meet-31',
      title: 'Интервью: Backend Developer',
      owner: 'Мария Кузнецова',
      slot: 'Сегодня, 16:30-17:00',
      statusLabel: 'Подтверждено',
      statusTone: 'success',
      linkLabel: 'Открыть ссылку',
    },
  ],
  activity: [
    {
      id: 'act-31',
      title: 'Получен фидбэк по резюме',
      description: 'HR запросил уточнения по последнему проекту.',
      time: '25 минут назад',
      tone: 'default',
    },
  ],
  pipeline: [
    { id: 'pipe-31', label: 'Отклик отправлен', count: 2, delta: '0', tone: 'default' },
    { id: 'pipe-32', label: 'Скрининг', count: 1, delta: '+1', tone: 'warning' },
    { id: 'pipe-33', label: 'Интервью', count: 1, delta: '+1', tone: 'success' },
    { id: 'pipe-34', label: 'Оффер', count: 0, delta: '0', tone: 'neutral' },
  ],
  chats: [
    {
      id: 'chat-31',
      participant: 'Мария Кузнецова (HR)',
      preview: 'Подтвердите слот интервью на сегодня',
      unread: 1,
      messages: [
        {
          id: 'msg-31-1',
          author: 'other',
          text: 'Подтвердите, пожалуйста, что сможете подключиться к интервью в 16:30.',
          time: '11:18',
        },
      ],
    },
  ],
}

export const previewDataByRole: Record<PreviewRole, PreviewDataset> = {
  Customer: customerData,
  Executor: executorData,
  Applicant: applicantData,
}

export const defaultPreviewRole: PreviewRole = 'Customer'

export const defaultPreviewView: PreviewView = 'dashboard'

const previewRoleSet = new Set<PreviewRole>(previewRoleOptions.map((option) => option.value))

export function isPreviewRole(value: string | null | undefined): value is PreviewRole {
  if (!value) {
    return false
  }

  return previewRoleSet.has(value as PreviewRole)
}

export function previewToneToBadgeVariant(
  tone: PreviewTone,
): 'default' | 'success' | 'destructive' | 'neutral' {
  if (tone === 'success') {
    return 'success'
  }

  if (tone === 'danger') {
    return 'destructive'
  }

  if (tone === 'neutral') {
    return 'neutral'
  }

  return 'default'
}
