export function LoginLegalNote() {
  return (
    <p className="mx-auto mt-5 block max-w-[420px] px-1 text-center text-label-micro font-normal leading-relaxed tracking-normal text-text-tertiary">
      Авторизуясь, вы принимаете условия{' '}
      <a href="#" className="underline transition-colors hover:text-foreground">
        Пользовательского соглашения
      </a>
      ,{' '}
      <a href="#" className="underline transition-colors hover:text-foreground">
        Договора-оферты
      </a>{' '}
      и{' '}
      <a href="#" className="underline transition-colors hover:text-foreground">
        Политику обработки персональных данных (152-ФЗ)
      </a>
      .
    </p>
  )
}
