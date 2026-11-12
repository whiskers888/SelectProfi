import { Link } from 'react-router-dom'
import { ChevronDown, LifeBuoy, Mail, ShieldCheck, Wallet } from 'lucide-react'
import { AuthLayout } from '@/components/auth'
import { routePaths } from '@/app/routePaths'

type FaqItem = {
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    question: 'Какие роли есть на платформе?',
    answer:
      'Заказчик — компания или ИП, которая открывает вакансии и нанимает специалистов. Исполнитель — самозанятый или ИП, который ведёт подбор кандидатов и получает выплаты за закрытые вакансии. Соискатель — специалист, который откликается на вакансии и проходит интервью.',
  },
  {
    question: 'Кто может стать заказчиком?',
    answer:
      'Юридическое лицо (ООО) или индивидуальный предприниматель. Для заключения договора потребуются ИНН и ОГРН либо ОГРНИП.',
  },
  {
    question: 'Кто может стать исполнителем?',
    answer:
      'Только самозанятый (НПД) или индивидуальный предприниматель. Физическое лицо не может брать заказы напрямую — для этого нужно подключиться к агентству-исполнителю. ИП может открыть собственную команду (агентство), нанять рекрутеров и выдать им доступ.',
  },
  {
    question: 'Нужно ли соискателю указывать юридический статус?',
    answer:
      'Нет. Соискатель не платит платформе и не заключает договор, поэтому юридические реквизиты не требуются.',
  },
  {
    question: 'Как защищены платежи?',
    answer:
      'Оплата резервируется на эскроу-счёте и высвобождается после закрытия вакансии. Закрывающие документы и чеки формируются автоматически через «Мой Налог» и ФНС.',
  },
  {
    question: 'Какие документы нужны при регистрации?',
    answer:
      'Заказчику — скан ЕГРЮЛ или ЕГРНИП. Исполнителю-самозанятому — справка о постановке на учёт КНД 1122030, исполнителю-ИП — скан ЕГРИП. Форматы: PDF или JPG до 15 МБ.',
  },
  {
    question: 'Как защищены персональные данные?',
    answer:
      'Данные обрабатываются в соответствии с 152-ФЗ. Доступ к контактам кандидатов открывается только после финального выбора или привязки рекрутера на 180 дней.',
  },
  {
    question: 'Можно ли изменить роль после регистрации?',
    answer:
      'Да. В кабинете можно переключаться между доступными ролями и редактировать профиль в разделе «Профиль».',
  },
]

export function FaqPage() {
  return (
    <AuthLayout footerNote="© 2026 КадрыТут — платформа автоматизации подбора персонала.">
      <section className="rounded-lg border border-border bg-card p-5 text-foreground shadow-surface sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
            <LifeBuoy className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="m-0 text-display-page-title text-foreground">Помощь</h1>
            <p className="m-0 mt-1 text-caption-meta text-muted-foreground">
              Частые вопросы о работе платформы
            </p>
          </div>
        </div>

        <div className="mt-6 divide-y divide-border border-y border-border">
          {faqItems.map((item) => (
            <details key={item.question} className="group py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md text-body-medium font-medium text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="m-0 mt-2 text-body-default text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-border bg-muted p-4">
          <p className="m-0 text-body-medium font-semibold text-foreground">
            Если у вас остались вопросы — напишите нам на почту
          </p>
          <a
            href="mailto:support@kadrytyt.ru"
            className="mt-1.5 inline-flex items-center gap-1.5 text-body-default font-medium text-primary hover:underline"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            support@kadrytyt.ru
          </a>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-label-micro uppercase text-text-tertiary">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            152-ФЗ защита данных
          </span>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-border" />
          <span className="flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-primary" aria-hidden="true" />
            Безопасный эскроу счёт
          </span>
        </div>

        <p className="m-0 mt-5 text-center text-caption-meta text-muted-foreground">
          <Link to={routePaths.auth} className="font-medium text-primary hover:underline">
            Вернуться ко входу
          </Link>
        </p>
      </section>
    </AuthLayout>
  )
}
