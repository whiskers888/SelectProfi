type ResumeContentInput = {
  resumeSkills: string
  resumeRichTextHtml: string
}

type ResumeAttachmentsInput = {
  resumeAttachmentLinks: string
}

export function buildResumeContentJson(form: ResumeContentInput): string {
  const skills = form.resumeSkills
    .split(',')
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0)

  const richTextHtml = form.resumeRichTextHtml.trim()
  const summary = richTextHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  // @dvnull: Ранее `resumeContentJson` содержал только plain-summary и skills; добавлен richTextHtml с сохранением summary для обратной совместимости payload.
  return JSON.stringify({
    summary,
    skills,
    richTextHtml,
  })
}

export function buildResumeAttachmentsJson(form: ResumeAttachmentsInput): string | undefined {
  if (!form.resumeAttachmentLinks.trim()) return undefined

  try {
    const links = JSON.parse(form.resumeAttachmentLinks)
    if (Array.isArray(links)) return JSON.stringify(links.filter((link) => link?.url?.trim()))
  } catch {
    // Старый формат: одна ссылка на строку.
  }

  const links = form.resumeAttachmentLinks.split('\n').map((url) => url.trim()).filter(Boolean)
  return links.length ? JSON.stringify(links.map((url) => ({ type: 'Другое', url }))) : undefined
}
