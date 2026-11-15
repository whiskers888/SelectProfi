import { type FormEvent, useMemo, useState } from 'react'
import { ArrowRight, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TiptapTextEditor } from '@/components/ui/tiptap-text-editor'
import type { WorkspaceCandidate } from '../model/data'
import { formatExperienceYears } from '../shell/workspaceShell.helpers'
import { ResumeLinksInput } from '../ResumeLinksInput'
import { ResumeFilesInput, type SelectedResumeFile } from '../ResumeFilesInput'

interface CandidateCreatePagePanelProps {
  applicantResponders: WorkspaceCandidate[]
  assignedCandidateIds: string[]
  availableCandidates: WorkspaceCandidate[]
  canAddToProject: boolean
  formValues: {
    fullName: string
    birthDate: string
    email: string
    phone: string
    specialization: string
    specializationId: string
    resumeTitle: string
    experienceYears: string
    resumeRichTextHtml: string
    resumeAttachmentLinks: string
  }
  isAddingCandidateFromBase?: boolean
  orderTitle?: string | null
  onAddCandidateFromBase?: (candidateId: string) => boolean | Promise<boolean>
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
      | 'experienceYears'
      | 'resumeRichTextHtml'
      | 'resumeAttachmentLinks',
    value: string,
  ) => void
  onSubmit: (event: FormEvent<HTMLFormElement>, files: SelectedResumeFile[]) => void | Promise<void>
  specializationOptions: Array<{ id: string; name: string }>
  vacancyTitle?: string | null
}

export function CandidateCreatePagePanel({
  applicantResponders,
  assignedCandidateIds,
  availableCandidates,
  canAddToProject,
  formValues,
  isAddingCandidateFromBase = false,
  orderTitle,
  onAddCandidateFromBase,
  onBack,
  onFieldChange,
  onSubmit,
  specializationOptions,
  vacancyTitle,
}: Readonly<CandidateCreatePagePanelProps>) {
  const [files, setFiles] = useState<SelectedResumeFile[]>([])
  const [candidateSearch, setCandidateSearch] = useState('')
  const [activeSource, setActiveSource] = useState(canAddToProject ? 'base' : 'upload')
  const projectCandidatesIds = useMemo(() => new Set(assignedCandidateIds), [assignedCandidateIds])
  const normalizedSearch = candidateSearch.trim().toLocaleLowerCase('ru-RU')
  const filteredCandidates = availableCandidates.filter((candidate) =>
    `${candidate.name} ${candidate.position}`.toLocaleLowerCase('ru-RU').includes(normalizedSearch),
  )
  const projectLabel = orderTitle?.trim() || vacancyTitle?.trim() || 'Мои кандидаты'
  const hasVisibleResumeText = formValues.resumeRichTextHtml.replace(/<[^>]*>/g, ' ').trim().length > 0
  const parsedExperienceYears = formValues.experienceYears.trim() ? Number(formValues.experienceYears) : null
  const isFormInvalid =
    !formValues.fullName.trim() ||
    !formValues.phone.trim() ||
    !formValues.specializationId.trim() ||
    !formValues.resumeTitle.trim() ||
    !hasVisibleResumeText ||
    (parsedExperienceYears !== null && (!Number.isInteger(parsedExperienceYears) || parsedExperienceYears < 0))

  async function handleAddCandidate(candidateId: string) {
    await onAddCandidateFromBase?.(candidateId)
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <nav aria-label="Хлебные крошки" className="overflow-x-auto">
        <ol className="flex min-w-max items-center gap-2 text-sm text-muted-foreground">
          <li>
            <button className="rounded-sm hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={onBack} type="button">
              Мои проекты в работе
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li className="max-w-[min(48vw,32rem)] truncate text-foreground" title={projectLabel}>
            {projectLabel}
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-primary">
            Добавить кандидата
          </li>
        </ol>
      </nav>

      <Card className="rounded-xl border-border p-4 shadow-none sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Добавить кандидата</h2>
            <p className="mt-1 text-sm text-muted-foreground">Выберите источник кандидата для проекта.</p>
          </div>
          <Button className="h-9 rounded-lg border-border text-muted-foreground" onClick={onBack} type="button" variant="outline">
            Назад к проекту
          </Button>
        </div>

        <Tabs className="mt-5" onValueChange={setActiveSource} value={activeSource}>
          <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded-lg border border-border bg-muted p-1 sm:grid-cols-3">
            <TabsTrigger className="h-10 rounded-md px-3 text-sm" value="base">
              Из своей базы
            </TabsTrigger>
            <TabsTrigger className="h-10 rounded-md px-3 text-sm" value="responses">
              Из откликов
            </TabsTrigger>
            <TabsTrigger className="h-10 rounded-md px-3 text-sm" value="upload">
              Загрузить резюме
            </TabsTrigger>
          </TabsList>

          <TabsContent className="mt-5" value="base">
            <section aria-labelledby="candidate-base-title" className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground" id="candidate-base-title">Кандидаты из вашей базы</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Добавьте существующий профиль в рабочий список проекта.</p>
                </div>
                <div className="w-full sm:max-w-xs">
                  <Label className="sr-only" htmlFor="candidate-base-search">Поиск кандидата</Label>
                  <Input
                    autoComplete="off"
                    className="h-10 rounded-lg border-border"
                    id="candidate-base-search"
                    onChange={(event) => setCandidateSearch(event.target.value)}
                    placeholder="Поиск по имени или специализации"
                    value={candidateSearch}
                  />
                </div>
              </div>

              {!canAddToProject ? (
                <p className="rounded-lg border border-warning/30 bg-warning-muted p-3 text-sm text-warning-foreground" role="status">
                  Откройте опубликованный проект, чтобы добавить кандидата в него.
                </p>
              ) : null}

              {filteredCandidates.length > 0 ? (
                <ul className="divide-y divide-border rounded-xl border border-border">
                  {filteredCandidates.map((candidate) => {
                    const isAlreadyAdded = projectCandidatesIds.has(candidate.id)
                    return (
                      <li className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4" key={candidate.id}>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{candidate.name}</p>
                          <p className="mt-1 truncate text-sm text-muted-foreground">{candidate.position}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Опыт: {formatExperienceYears(candidate.experienceYears)}</p>
                        </div>
                        {isAlreadyAdded ? (
                          <Badge className="shrink-0" variant="neutral">Уже в проекте</Badge>
                        ) : (
                          <Button
                            className="h-9 shrink-0 rounded-lg"
                            disabled={!canAddToProject || isAddingCandidateFromBase || !onAddCandidateFromBase}
                            onClick={() => void handleAddCandidate(candidate.id)}
                            type="button"
                            variant="outline"
                          >
                            <UserPlus aria-hidden="true" className="mr-2" size={16} />
                            {isAddingCandidateFromBase ? 'Добавляем…' : 'Добавить в проект'}
                          </Button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted p-6 text-center text-sm text-muted-foreground">
                  {availableCandidates.length === 0 ? 'В своей базе пока нет кандидатов.' : 'По запросу ничего не найдено.'}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent className="mt-5" value="responses">
            <section aria-labelledby="candidate-responses-title" className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-foreground" id="candidate-responses-title">Отклики на проект</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Откликнувшиеся соискатели уже находятся в рабочем списке проекта и не добавляются повторно.
                </p>
              </div>
              {applicantResponders.length > 0 ? (
                <ul className="divide-y divide-border rounded-xl border border-border">
                  {applicantResponders.map((candidate) => (
                    <li className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4" key={candidate.id}>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{candidate.name}</p>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{candidate.position}</p>
                        {candidate.experienceYears !== null && candidate.experienceYears !== undefined ? (
                          <p className="mt-2 text-sm text-muted-foreground">Опыт: {formatExperienceYears(candidate.experienceYears)}</p>
                        ) : candidate.experienceSummary?.trim() ? (
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">Опыт: {candidate.experienceSummary}</p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={candidate.statusTone === 'success' ? 'success' : 'neutral'}>{candidate.statusLabel}</Badge>
                        <span className="text-xs text-muted-foreground">Уже в проекте</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted p-6 text-center text-sm text-muted-foreground">
                  {canAddToProject ? 'На этот проект пока никто не откликнулся.' : 'Отклики появятся после выбора проекта.'}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent className="mt-5" value="upload">
            <section aria-labelledby="candidate-upload-title" className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <h3 className="font-semibold text-foreground" id="candidate-upload-title">Загрузить резюме</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Файл сохранится как вложение к профилю. Данные кандидата нужно заполнить вручную.
                </p>
              </div>

              <form className="grid gap-4" onSubmit={(event) => onSubmit(event, files)}>
                <div className="space-y-2">
                  <Label className="text-muted-foreground" htmlFor="workspace-candidate-full-name">
                    ФИО кандидата <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="workspace-candidate-full-name"
                    value={formValues.fullName}
                    onChange={(event) => onFieldChange('fullName', event.target.value)}
                    placeholder="Например, Елена Петрова"
                    maxLength={200}
                    required
                    className="h-11 rounded-xl border-border text-foreground"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground" htmlFor="workspace-candidate-birth-date">Дата рождения</Label>
                    <Input
                      id="workspace-candidate-birth-date"
                      type="date"
                      value={formValues.birthDate}
                      onChange={(event) => onFieldChange('birthDate', event.target.value)}
                      className="h-11 rounded-xl border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground" htmlFor="workspace-candidate-email">Email</Label>
                    <Input
                      id="workspace-candidate-email"
                      type="email"
                      value={formValues.email}
                      onChange={(event) => onFieldChange('email', event.target.value)}
                      placeholder="candidate@example.com"
                      maxLength={254}
                      className="h-11 rounded-xl border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground" htmlFor="workspace-candidate-phone">
                      Телефон <span aria-hidden="true" className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="workspace-candidate-phone"
                      value={formValues.phone}
                      onChange={(event) => onFieldChange('phone', event.target.value)}
                      placeholder="+7 999 000-00-00"
                      maxLength={32}
                      required
                      className="h-11 rounded-xl border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground" htmlFor="workspace-candidate-specialization">
                    Позиция / специализация <span aria-hidden="true" className="text-destructive">*</span>
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
                    className="h-11 w-full rounded-xl border border-border bg-card px-3 text-foreground"
                  >
                    <option value="">Выберите специализацию</option>
                    {specializationOptions.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground" htmlFor="workspace-candidate-resume-title">
                    Заголовок резюме <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="workspace-candidate-resume-title"
                    value={formValues.resumeTitle}
                    onChange={(event) => onFieldChange('resumeTitle', event.target.value)}
                    placeholder="Senior Frontend Developer"
                    maxLength={200}
                    required
                    className="h-11 rounded-xl border-border text-foreground"
                  />
                </div>

                <div className="space-y-2 sm:max-w-xs">
                  <Label className="text-muted-foreground" htmlFor="workspace-candidate-experience-years">Опыт работы, лет</Label>
                  <Input
                    id="workspace-candidate-experience-years"
                    inputMode="numeric"
                    min={0}
                    onChange={(event) => onFieldChange('experienceYears', event.target.value)}
                    placeholder="Например, 5"
                    step={1}
                    type="number"
                    value={formValues.experienceYears}
                    className="h-11 rounded-xl border-border text-foreground"
                    aria-invalid={parsedExperienceYears !== null && (!Number.isInteger(parsedExperienceYears) || parsedExperienceYears < 0)}
                  />
                  {parsedExperienceYears !== null && Number.isInteger(parsedExperienceYears) && parsedExperienceYears >= 0 ? (
                    <p className="text-xs text-muted-foreground">{formatExperienceYears(parsedExperienceYears)}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Содержимое резюме <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <TiptapTextEditor
                    value={formValues.resumeRichTextHtml}
                    onChange={(value) => onFieldChange('resumeRichTextHtml', value)}
                    placeholder="Опишите опыт, стек, достижения."
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground" htmlFor="workspace-candidate-resume-attachments">Ссылки на вложения</Label>
                    <ResumeLinksInput
                      id="workspace-candidate-resume-attachments"
                      value={formValues.resumeAttachmentLinks}
                      onChange={(value) => onFieldChange('resumeAttachmentLinks', value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground" htmlFor="workspace-candidate-resume-files">Файлы резюме</Label>
                    <ResumeFilesInput id="workspace-candidate-resume-files" value={files} onChange={setFiles} />
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button className="h-10 rounded-xl border-border text-muted-foreground" onClick={onBack} type="button" variant="outline">
                    Назад
                  </Button>
                  <Button className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" type="submit" disabled={isFormInvalid}>
                    Добавить кандидата
                    <ArrowRight aria-hidden="true" className="ml-2" size={16} />
                  </Button>
                </div>
              </form>
            </section>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
