import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const fileTypes = ['Сертификат', 'Трудовая выписка', 'Рекомендация', 'Диплом', 'Портфолио', 'Видео-визитка', 'Другое'] as const
export type ResumeFileType = (typeof fileTypes)[number]
export type SelectedResumeFile = { file: File; type: ResumeFileType; customType: string }

type Props = {
  id: string
  value: SelectedResumeFile[]
  onChange: (files: SelectedResumeFile[]) => void
  disabled?: boolean
}

const maxFileSize = 25 * 1024 * 1024

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function ResumeFilesInput({ id, value: files, onChange, disabled = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return

    const valid = Array.from(newFiles).filter((file) => file.size <= maxFileSize)
    setError(valid.length === newFiles.length ? '' : 'Размер каждого файла — до 25 MB.')
    onChange([...files, ...valid.map((file) => ({ file, type: 'Сертификат' as ResumeFileType, customType: '' }))])
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <Label className="text-slate-600">Прикреплённые файлы</Label>
      <p className="text-xs text-slate-500">PDF, документы, изображения и видео. До 25 MB на файл.</p>
      <Button type="button" variant="outline" disabled={disabled} onClick={() => inputRef.current?.click()}>
        📎 Прикрепить файлы
      </Button>
      <input ref={inputRef} id={id} className="sr-only" type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.mp4,.webm" onChange={(event) => addFiles(event.target.files)} disabled={disabled} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {files.map((item, index) => (
        <div key={`${item.file.name}-${index}`} className="space-y-2 rounded-xl border border-slate-200 p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>📄 {item.file.name} <span className="text-slate-500">· {formatSize(item.file.size)}</span></span>
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onChange(files.filter((_, i) => i !== index))}>Удалить</Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <select aria-label={`Тип файла ${index + 1}`} className="h-10 rounded-lg border border-slate-200 bg-background px-3 text-sm text-slate-900" value={item.type} disabled={disabled} onChange={(event) => onChange(files.map((currentItem, i) => i === index ? { ...currentItem, type: event.target.value as ResumeFileType } : currentItem))}>
              {fileTypes.map((fileType) => <option key={fileType} value={fileType}>{fileType}</option>)}
            </select>
            {item.type === 'Другое' ? <Input aria-label={`Свой тип файла ${index + 1}`} value={item.customType} disabled={disabled} placeholder="Например, характеристика" onChange={(event) => onChange(files.map((currentItem, i) => i === index ? { ...currentItem, customType: event.target.value } : currentItem))} /> : null}
          </div>
        </div>
      ))}
    </div>
  )
}
