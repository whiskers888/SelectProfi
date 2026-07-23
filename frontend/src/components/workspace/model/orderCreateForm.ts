export type OrderCreateFormValues = {
  title: string
  organization: string
  specialization: string
  specializationId: string
  price: string
  location: string
  employeeCompensation: string
  functional: string
  requirements: string
  otherConditions: string
  requestedCandidatesCount: string
}

export type OrderCreateFormField = keyof OrderCreateFormValues

export function createEmptyOrderFormValues(): OrderCreateFormValues {
  return {
    title: '',
    organization: '',
    specialization: '',
    specializationId: '',
    price: '',
    location: '',
    employeeCompensation: '',
    functional: '',
    requirements: '',
    otherConditions: '',
    requestedCandidatesCount: '1',
  }
}
