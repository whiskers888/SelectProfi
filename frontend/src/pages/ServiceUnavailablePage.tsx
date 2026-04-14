export function ServiceUnavailablePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Сервис временно недоступен</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Не удалось подключиться к серверу.
        </p>
        <button
          type="button"
          className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          onClick={() => window.location.reload()}
        >
          Повторить
        </button>
      </section>
    </main>
  )
}
