type ResumeContentInput = {
  resumeSkills: string
  resumeSummary: string
}

type ResumeAttachmentsInput = {
  resumeAttachmentLinks: string
}

export function buildResumeContentJson(form: ResumeContentInput): string {
  const skills = form.resumeSkills
    .split(',')
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0)

  // @dvnull: Ранее `resumeContentJson` строился локально в VacanciesPage; вынесено в feature/lib без изменения структуры payload.
  return JSON.stringify({
    summary: form.resumeSummary.trim(),
    skills,
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
