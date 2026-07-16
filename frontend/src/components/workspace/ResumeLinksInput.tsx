import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const resumeLinkTypes = ['GitHub', 'LinkedIn', 'Telegram', 'VK', 'Портфолио / сайт', 'Behance', 'YouTube / видео-визитка', 'Другое'] as const
type ResumeLinkType = (typeof resumeLinkTypes)[number]
type ResumeLink = { type: ResumeLinkType; customType?: string; url: string }

type Props = { id: string; value: string; onChange: (value: string) => void; disabled?: boolean }

function parseLinks(value: string): ResumeLink[] {
  if (!value.trim()) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed) && parsed.every((item) => item && typeof item.url === 'string')) {
      return parsed.map((item) => ({ type: resumeLinkTypes.includes(item.type as ResumeLinkType) ? item.type : 'Другое', customType: typeof item.customType === 'string' ? item.customType : undefined, url: item.url }))
    }
  } catch { /* old newline format */ }
  return value.split('\n').map((url) => ({ type: 'Другое' as const, url })).filter((link) => link.url.trim())
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch { return false }
}

export function ResumeLinksInput({ id, value, onChange, disabled = false }: Props) {
  const links = parseLinks(value)
  const update = (next: ResumeLink[]) => onChange(next.length ? JSON.stringify(next) : '')

  return <div className="space-y-2">
    <Label className="text-slate-600" htmlFor={`${id}-url-0`}>Ссылки на вложения</Label>
    <p className="text-xs text-slate-500">GitHub, портфолио, соцсети или видео-визитка. Необязательно.</p>
    {links.map((link, index) => {
      const invalid = Boolean(link.url.trim()) && !isValidUrl(link.url.trim())
      return <div key={`${id}-${index}`} className="space-y-1">
        <div className="grid gap-2 sm:grid-cols-[minmax(10rem,14rem)_1fr_auto]">
          <select aria-label={`Тип ссылки ${index + 1}`} className="h-11 rounded-xl border border-slate-200 bg-background px-3 text-sm text-slate-900" disabled={disabled} value={link.type} onChange={(event) => update(links.map((item, i) => i === index ? { ...item, type: event.target.value as ResumeLinkType } : item))}>
            {resumeLinkTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <Input id={`${id}-url-${index}`} type="url" inputMode="url" value={link.url} aria-invalid={invalid} disabled={disabled} placeholder="https://..." onChange={(event) => update(links.map((item, i) => i === index ? { ...item, url: event.target.value } : item))} />
          <Button type="button" variant="outline" disabled={disabled} onClick={() => update(links.filter((_, i) => i !== index))}>Удалить</Button>
        </div>
        {link.type === 'Другое' ? <Input aria-label={`Свой тип ссылки ${index + 1}`} value={link.customType ?? ''} disabled={disabled} placeholder="Например, личный сайт или трудовая выписка" onChange={(event) => update(links.map((item, i) => i === index ? { ...item, customType: event.target.value } : item))} /> : null}
        {invalid ? <p className="text-xs text-destructive">Укажите URL с http:// или https://.</p> : null}
      </div>
    })}
    <Button type="button" variant="outline" disabled={disabled} onClick={() => update([...links, { type: 'GitHub', url: '' }])}>+ Добавить ссылку</Button>
  </div>
}
