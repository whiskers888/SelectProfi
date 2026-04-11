import type { MyProfileResponse } from '@/features/profile/model'
import { toCustomerLegalFormValue } from '@/features/profile/lib/enums'
import { toCommaSeparated } from '@/features/profile/lib/formatters'

export function createCommonProfileFormValues(profile: MyProfileResponse) {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone ?? '',
  }
}

export function createApplicantProfileFormValues(profile: MyProfileResponse) {
  return {
    resumeTitle: profile.applicantProfile?.resumeTitle ?? '',
    previousCompanyName: profile.applicantProfile?.previousCompanyName ?? '',
    workPeriod: profile.applicantProfile?.workPeriod ?? '',
    experienceSummary: profile.applicantProfile?.experienceSummary ?? '',
    achievements: profile.applicantProfile?.achievements ?? '',
    education: profile.applicantProfile?.education ?? '',
    skills: toCommaSeparated(profile.applicantProfile?.skills),
    certificates: toCommaSeparated(profile.applicantProfile?.certificates),
    portfolioUrl: profile.applicantProfile?.portfolioUrl ?? '',
    about: profile.applicantProfile?.about ?? '',
    desiredSalary:
      profile.applicantProfile?.desiredSalary === undefined || profile.applicantProfile?.desiredSalary === null
        ? ''
        : String(profile.applicantProfile.desiredSalary),
  }
}

export function createCustomerProfileFormValues(profile: MyProfileResponse) {
  return {
    inn: profile.customerProfile?.inn ?? '',
    legalForm: toCustomerLegalFormValue(profile.customerProfile?.legalForm),
    egrn: profile.customerProfile?.egrn ?? '',
    egrnip: profile.customerProfile?.egrnip ?? '',
    companyName: profile.customerProfile?.companyName ?? '',
    companyLogoUrl: profile.customerProfile?.companyLogoUrl ?? '',
    offerAccepted: profile.customerProfile?.offerAccepted ?? false,
    offerVersion: profile.customerProfile?.offerVersion ?? '',
  }
}

export function createExecutorProfileFormValues(profile: MyProfileResponse) {
  return {
    employmentType: profile.executorProfile?.employmentType ?? '',
    projectTitle: profile.executorProfile?.projectTitle ?? '',
    projectCompanyName: profile.executorProfile?.projectCompanyName ?? '',
    experienceSummary: profile.executorProfile?.experienceSummary ?? '',
    achievements: profile.executorProfile?.achievements ?? '',
    certificates: toCommaSeparated(profile.executorProfile?.certificates),
    grade: profile.executorProfile?.grade ?? '',
    extraInfo: profile.executorProfile?.extraInfo ?? '',
  }
}
