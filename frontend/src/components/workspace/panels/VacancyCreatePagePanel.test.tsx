import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VacancyCreatePagePanel } from './VacancyCreatePagePanel'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderVacancyPanel(description = '<p>Разработка продукта</p><p>Опыт от пяти лет</p>') {
  return render(
    <VacancyCreatePagePanel
      formValues={{ title: 'Senior разработчик', description }}
      isCreatingVacancy={false}
      isSendingVacancyToCustomer={false}
      linkedOrder={{ id: 'order-1', title: 'Проект разработки' }}
      onBack={vi.fn()}
      onFieldChange={vi.fn()}
      onSendToCustomer={vi.fn()}
      onSubmitDraft={vi.fn()}
    />,
  )
}

describe('VacancyCreatePagePanel exports', () => {
  it('downloads only the public vacancy title and description as UTF-8 text', async () => {
    let createdBlob: Blob | undefined
    const createObjectUrl = vi.fn((blob: Blob) => {
      createdBlob = blob
      return 'blob:vacancy'
    })
    const revokeObjectUrl = vi.fn()
    const createDescriptor = Object.getOwnPropertyDescriptor(URL, 'createObjectURL')
    const revokeDescriptor = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL')
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectUrl })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectUrl })

    let downloadedFileName = ''
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      downloadedFileName = this.download
    })

    renderVacancyPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Скачать TXT' }))

    const downloadedBlob = createdBlob
    expect(downloadedBlob).toBeInstanceOf(Blob)
    expect(downloadedBlob?.type).toBe('text/plain;charset=utf-8')
    expect(downloadedFileName).toBe('Senior-разработчик.txt')
    expect(createObjectUrl).toHaveBeenCalledOnce()

    const fileText = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      if (downloadedBlob) reader.readAsText(downloadedBlob)
      else reject(new Error('Export did not create a file'))
    })
    expect(fileText).toBe('Senior разработчик\n\nРазработка продукта\nОпыт от пяти лет\n')

    await new Promise((resolve) => window.setTimeout(resolve, 0))
    if (createDescriptor) Object.defineProperty(URL, 'createObjectURL', createDescriptor)
    else Reflect.deleteProperty(URL, 'createObjectURL')
    if (revokeDescriptor) Object.defineProperty(URL, 'revokeObjectURL', revokeDescriptor)
    else Reflect.deleteProperty(URL, 'revokeObjectURL')
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:vacancy')
  })

  it('prints a text-only vacancy document and removes markup from description', () => {
    const printDocument = document.implementation.createHTMLDocument()
    const printWindow = {
      document: printDocument,
      opener: window,
      addEventListener: vi.fn(),
      focus: vi.fn(),
      print: vi.fn(),
      close: vi.fn(),
    }
    vi.spyOn(window, 'open').mockReturnValue(printWindow as unknown as Window)

    renderVacancyPanel('<p>Описание вакансии</p><script>document.body.textContent = "bad"</script>')
    fireEvent.click(screen.getByRole('button', { name: 'Печать / PDF' }))

    expect(printDocument.title).toBe('Senior разработчик')
    expect(printDocument.body.textContent).toContain('Senior разработчик')
    expect(printDocument.body.textContent).toContain('Описание вакансии')
    expect(printDocument.body.textContent).not.toContain('document.body')
    expect(printDocument.querySelector('script')).toBeNull()
    expect(printWindow.opener).toBeNull()
    expect(printWindow.focus).toHaveBeenCalledOnce()
    expect(printWindow.print).toHaveBeenCalledOnce()
  })

  it('keeps export unavailable until vacancy has a title and description', () => {
    renderVacancyPanel('')

    expect(screen.getByRole('button', { name: 'Скачать TXT' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'Печать / PDF' }).hasAttribute('disabled')).toBe(true)
  })
})
