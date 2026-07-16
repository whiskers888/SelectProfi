import { type FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TiptapTextEditor } from '@/components/ui/tiptap-text-editor'
import { Textarea } from '@/components/ui/textarea'

type CandidateCreatePagePanelProps = {
  formValues: {
    fullName: string
    birthDate: string
    email: string
    phone: string
    specialization: string
    specializationId: string
    resumeTitle: string
    resumeRichTextHtml: string
    resumeAttachmentLinks: string
  }
  onBack: () => void
  specializationOptions: { id: string; name: string }[]
  onFieldChange: (
    field:
      | 'fullName'
      | 'birthDate'
      | 'email'
      | 'phone'
      | 'specialization'
      | 'specializationId'
      | 'resumeTitle'
      | 'resumeRichTextHtml'
      | 'resumeAttachmentLinks',
    value: string,
  ) => void
  onSubmit: (event: FormEvent<HTMLFormElement>, files: File[]) => void | Promise<void>
}

export function CandidateCreatePagePanel({
  formValues,
  onBack,
  onFieldChange,
  onSubmit,
  specializationOptions,
}: CandidateCreatePagePanelProps) {
  const [files, setFiles] = useState<File[]>([])
  const hasVisibleResumeText = formValues.resumeRichTextHtml.replace(/<[^>]*>/g, ' ').trim().length > 0
  const invalidAttachmentLink = formValues.resumeAttachmentLinks
    .split('\n')
    .map((link) => link.trim())
    .filter(Boolean)
    .some((link) => {
      try {
        const url = new URL(link)
        return url.protocol !== 'http:' && url.protocol !== 'https:'
      } catch {
        return true
      }
    })
  const isFormInvalid =
    !formValues.fullName.trim() ||
    !formValues.phone.trim() ||
    !formValues.specializationId.trim() ||
    !formValues.resumeTitle.trim() ||
    !hasVisibleResumeText ||
    invalidAttachmentLink

  return (
    <Card className="rounded-xl border-slate-200 p-4 shadow-none">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-900">Добавление кандидата</h3>
        <p className="text-sm text-slate-600">Заполните профиль кандидата и данные резюме.</p>
      </div>

      <form className="mt-4 grid gap-4" onSubmit={(event) => onSubmit(event, files)}>
        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-candidate-full-name">
            ФИО кандидата
          </Label>
          <Input
            id="workspace-candidate-full-name"
            value={formValues.fullName}
            onChange={(event) => onFieldChange('fullName', event.target.value)}
            placeholder="Например, Елена Петрова"
            maxLength={200}
            required
            className="h-11 rounded-xl border-slate-200 text-slate-900"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workspace-candidate-files">Прикрепить файлы</Label>
          <Input
            id="workspace-candidate-files"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.mp4,.webm"
            onChange={(event) => setFiles(Array.from(event.target.files ?? []).filter((file) => file.size <= 25 * 1024 * 1024))}
          />
          {files.map((file) => (
            <div key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between text-sm">
              <span>{file.name} ({Math.ceil(file.size / 1024)} KB)</span>
              <Button type="button" variant="ghost" onClick={() => setFiles((current) => current.filter((item) => item !== file))}>Удалить</Button>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-slate-600" htmlFor="workspace-candidate-birth-date">
              Дата рождения
            </Label>
            <Input
              id="workspace-candidate-birth-date"
              type="date"
              value={formValues.birthDate}
              onChange={(event) => onFieldChange('birthDate', event.target.value)}
              className="h-11 rounded-xl border-slate-200 text-slate-900"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600" htmlFor="workspace-candidate-email">
              Email
            </Label>
            <Input
              id="workspace-candidate-email"
              type="email"
              value={formValues.email}
              onChange={(event) => onFieldChange('email', event.target.value)}
              placeholder="candidate@example.com"
              maxLength={254}
              className="h-11 rounded-xl border-slate-200 text-slate-900"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600" htmlFor="workspace-candidate-phone">
              Телефон
            </Label>
            <Input
              id="workspace-candidate-phone"
              value={formValues.phone}
              onChange={(event) => onFieldChange('phone', event.target.value)}
              placeholder="+7 999 000-00-00"
              maxLength={32}
              className="h-11 rounded-xl border-slate-200 text-slate-900"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-candidate-specialization">
            Позиция / специализация
          </Label>
          <select
            id="workspace-candidate-specialization"
            value={formValues.specializationId}
            onChange={(event) => onFieldChange('specializationId', event.target.value)}
            required
            className="h-11 w-full rounded-xl border border-slate-200 bg-background px-3 text-slate-900"
          >
            <option value="">Выберите специализацию</option>
            {specializationOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-candidate-resume-title">
            Заголовок резюме
          </Label>
          <Input
            id="workspace-candidate-resume-title"
            value={formValues.resumeTitle}
            onChange={(event) => onFieldChange('resumeTitle', event.target.value)}
            placeholder="Senior Frontend Developer"
            maxLength={200}
            required
            className="h-11 rounded-xl border-slate-200 text-slate-900"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600">Содержимое резюме</Label>
          {/* @dvnull: Легаси rich-text-editor на execCommand заменен на tiptap для единого editor-стека. */}
          <TiptapTextEditor
            value={formValues.resumeRichTextHtml}
            onChange={(value) => onFieldChange('resumeRichTextHtml', value)}
            placeholder="Опишите опыт, стек, достижения."
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-candidate-resume-attachments">
            Ссылки на вложения
          </Label>
          <Textarea
            id="workspace-candidate-resume-attachments"
            value={formValues.resumeAttachmentLinks}
            onChange={(event) => onFieldChange('resumeAttachmentLinks', event.target.value)}
            placeholder="Одна ссылка на строку (облако, портфолио, pdf)."
            maxLength={2000}
            className="min-h-[100px] rounded-xl border-slate-200 text-slate-900"
            aria-invalid={invalidAttachmentLink}
            aria-describedby={invalidAttachmentLink ? 'workspace-candidate-resume-attachments-error' : undefined}
          />
          {invalidAttachmentLink ? (
            <p id="workspace-candidate-resume-attachments-error" className="text-sm text-destructive" role="alert">
              Укажите ссылку в формате https://example.com или удалите эту строку.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            className="h-10 rounded-xl border-slate-200 text-slate-700"
            onClick={onBack}
            type="button"
            variant="outline"
          >
            Назад
          </Button>
          <Button
            className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            type="submit"
            disabled={isFormInvalid}
          >
            Добавить кандидата
          </Button>
        </div>
      </form>
    </Card>
  )
}
