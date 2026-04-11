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
  const links = form.resumeAttachmentLinks
    .split('\n')
    .map((link) => link.trim())
    .filter((link) => link.length > 0)

  if (links.length === 0) {
    return undefined
  }

  return JSON.stringify(links)
}
