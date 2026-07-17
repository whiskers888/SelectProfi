// src/components/workspace/shell/hooks/useWorkspaceForms.ts
import { useState } from 'react';

export function useWorkspaceForms() {
    const [createOrderFormValues, setCreateOrderFormValues] = useState({
        title: '',
        organization: '',
        specialization: '',
        specializationId: '',
        price: '',
        note: '',
        requestedCandidatesCount: '1',
    });

    const [createCandidateFormValues, setCreateCandidateFormValues] = useState({
        fullName: '',
        birthDate: '',
        email: '',
        phone: '',
        specialization: '',
        resumeTitle: '',
        resumeRichTextHtml: '',
        resumeAttachmentLinks: '',
    });

    const [createApplicantResponseFormValues, setCreateApplicantResponseFormValues] = useState({
        fullName: '',
        birthDate: '',
        email: '',
        phone: '',
        specialization: '',
        resumeTitle: '',
        resumeRichTextHtml: '',
        resumeAttachmentLinks: '',
    });

    const [createVacancyFormValues, setCreateVacancyFormValues] = useState({
        title: '',
        description: '',
    });

    return {
        createOrderFormValues, setCreateOrderFormValues,
        createCandidateFormValues, setCreateCandidateFormValues,
        createApplicantResponseFormValues, setCreateApplicantResponseFormValues,
        createVacancyFormValues, setCreateVacancyFormValues,
    };
}