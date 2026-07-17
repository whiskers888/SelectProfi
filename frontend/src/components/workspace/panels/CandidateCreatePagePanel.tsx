import { type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TiptapTextEditor } from '@/components/ui/tiptap-text-editor'
import { ResumeLinksInput } from '../ResumeLinksInput'
import { ResumeFilesInput } from '../ResumeFilesInput'

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
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  specializationOptions: Array<{ id: string; name: string }>
}

export function CandidateCreatePagePanel({
  formValues,
  onBack,
  onFieldChange,
  onSubmit,
  specializationOptions,
}: CandidateCreatePagePanelProps) {
  const hasVisibleResumeText = formValues.resumeRichTextHtml.replace(/<[^>]*>/g, ' ').trim().length > 0
  const isFormInvalid =
    !formValues.fullName.trim() ||
    !formValues.phone.trim() ||
    !formValues.specializationId.trim() ||
    !formValues.resumeTitle.trim() ||
    !hasVisibleResumeText

  return (
    <Card className="rounded-xl border-slate-200 p-4 shadow-none">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-900">Добавление кандидата</h3>
        <p className="text-sm text-slate-600">Заполните профиль кандидата и данные резюме.</p>
      </div>

      <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
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
              required
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
            onChange={(event) => {
              const specializationId = event.target.value
              const specialization = specializationOptions.find((item) => item.id === specializationId)?.name ?? ''
              onFieldChange('specializationId', specializationId)
              onFieldChange('specialization', specialization)
            }}
            required
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900"
          >
            <option value="">Выберите специализацию</option>
            {specializationOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
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
        <ResumeLinksInput
            id="workspace-candidate-resume-attachments"
            value={formValues.resumeAttachmentLinks}
            onChange={(value) => onFieldChange('resumeAttachmentLinks', value)}
        />
        <ResumeFilesInput id="workspace-candidate-resume-files" />
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
