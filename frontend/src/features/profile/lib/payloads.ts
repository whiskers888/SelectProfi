import type { ExecutorEmploymentType, UpdateMyProfileRequest } from '@/shared/api/profile'
import { toCustomerLegalFormPayload } from '@/features/profile/lib/enums'
import { fromCommaSeparated, normalizeOptional } from '@/features/profile/lib/formatters'

type BaseProfilePayload = Pick<UpdateMyProfileRequest, 'firstName' | 'lastName' | 'phone'>

type ApplicantFormValues = {
  resumeTitle: string
  previousCompanyName: string
  workPeriod: string
  experienceSummary: string
  achievements: string
  education: string
  skills: string
  certificates: string
  portfolioUrl: string
  about: string
  desiredSalary: string
}

type CustomerFormValues = {
  inn: string
  legalForm: '' | 'Ooo' | 'Ip'
  egrn: string
  egrnip: string
  companyName: string
  companyLogoUrl: string
  offerAccepted: boolean
  offerVersion: string
}

type ExecutorFormValues = {
  projectTitle: string
  projectCompanyName: string
  experienceSummary: string
  achievements: string
  certificates: string
  grade: string
  extraInfo: string
}

export function buildApplicantUpdatePayload(
  basePayload: BaseProfilePayload,
  formValues: ApplicantFormValues,
): UpdateMyProfileRequest {
  const desiredSalary = formValues.desiredSalary.trim() ? Number(formValues.desiredSalary.trim()) : undefined

  return {
    ...basePayload,
    applicantProfile: {
      resumeTitle: normalizeOptional(formValues.resumeTitle),
      previousCompanyName: normalizeOptional(formValues.previousCompanyName),
      workPeriod: normalizeOptional(formValues.workPeriod),
      experienceSummary: normalizeOptional(formValues.experienceSummary),
      achievements: normalizeOptional(formValues.achievements),
      education: normalizeOptional(formValues.education),
      skills: fromCommaSeparated(formValues.skills),
      certificates: fromCommaSeparated(formValues.certificates),
      portfolioUrl: normalizeOptional(formValues.portfolioUrl),
      about: normalizeOptional(formValues.about),
      desiredSalary,
    },
  }
}

type BuildCustomerUpdatePayloadArgs = {
  basePayload: BaseProfilePayload
  formValues: CustomerFormValues
  currentOfferAccepted: boolean
  currentOfferVersion: string
}

export function buildCustomerUpdatePayload({
  basePayload,
  formValues,
  currentOfferAccepted,
  currentOfferVersion,
}: BuildCustomerUpdatePayloadArgs): UpdateMyProfileRequest {
  const nextOfferVersion = formValues.offerVersion.trim()
  const offerChanged =
    currentOfferAccepted !== formValues.offerAccepted || currentOfferVersion.trim() !== nextOfferVersion

  return {
    ...basePayload,
    customerProfile: {
      inn: normalizeOptional(formValues.inn),
      legalForm: toCustomerLegalFormPayload(formValues.legalForm),
      egrn: normalizeOptional(formValues.egrn),
      egrnip: normalizeOptional(formValues.egrnip),
      companyName: normalizeOptional(formValues.companyName),
      companyLogoUrl: normalizeOptional(formValues.companyLogoUrl),
      offerAccepted: offerChanged ? formValues.offerAccepted : undefined,
      offerVersion: offerChanged ? normalizeOptional(formValues.offerVersion) : undefined,
    },
  }
}

export function buildExecutorUpdatePayload(
  basePayload: BaseProfilePayload,
  formValues: ExecutorFormValues,
  employmentType: ExecutorEmploymentType,
): UpdateMyProfileRequest {
  return {
    ...basePayload,
    executorProfile: {
      employmentType,
      projectTitle: normalizeOptional(formValues.projectTitle),
      projectCompanyName: normalizeOptional(formValues.projectCompanyName),
      experienceSummary: normalizeOptional(formValues.experienceSummary),
      achievements: normalizeOptional(formValues.achievements),
      certificates: fromCommaSeparated(formValues.certificates),
      grade: normalizeOptional(formValues.grade),
      extraInfo: normalizeOptional(formValues.extraInfo),
    },
  }
}
