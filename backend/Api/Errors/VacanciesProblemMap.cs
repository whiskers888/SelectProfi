using SelectProfi.backend.Application.Vacancies.CreateVacancy;
using SelectProfi.backend.Application.Vacancies.DeleteVacancy;
using SelectProfi.backend.Application.Vacancies.GetVacancies;
using SelectProfi.backend.Application.Vacancies.GetVacancyById;
using SelectProfi.backend.Application.Vacancies.UpdateVacancy;
using SelectProfi.backend.Application.Vacancies.UpdateVacancyStatus;
using SelectProfi.backend.Application.Candidates.AddCandidateFromBase;
using SelectProfi.backend.Application.Candidates.CreateCandidateResume;
using SelectProfi.backend.Application.Candidates.GetVacancyCandidateContactsForExecutor;
using SelectProfi.backend.Application.Candidates.GetVacancyCandidates;
using SelectProfi.backend.Application.Candidates.GetSelectedCandidateContacts;
using SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;
using SelectProfi.backend.Application.Candidates.UpdateVacancyCandidateStage;

namespace SelectProfi.backend.Errors;

public static class VacanciesProblemMap
{
    private static readonly ApiProblemDescriptor OrderNotFound = new(
        StatusCodes.Status404NotFound,
        "Не найдено",
        "order_not_found",
        "Заказ не найден.");

    private static readonly ApiProblemDescriptor VacancyNotFound = new(
        StatusCodes.Status404NotFound,
        "Не найдено",
        "vacancy_not_found",
        "Вакансия не найдена.");

    private static readonly ApiProblemDescriptor VacancyCreateForbidden = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "vacancy_create_forbidden",
        "У вас нет доступа к созданию вакансии для этого заказа.");

    private static readonly ApiProblemDescriptor VacancyAccessForbidden = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "vacancy_access_forbidden",
        "У вас нет доступа к этой вакансии.");

    private static readonly ApiProblemDescriptor VacancyListAccessForbidden = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "vacancy_list_access_forbidden",
        "У вас нет доступа к списку вакансий.");

    private static readonly ApiProblemDescriptor CreateVacancyConflict = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "vacancy_conflict",
        "Не удалось создать вакансию из-за конфликта данных.");

    private static readonly ApiProblemDescriptor UpdateVacancyConflict = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "vacancy_conflict",
        "Не удалось обновить вакансию из-за конфликта данных.");

    private static readonly ApiProblemDescriptor DeleteVacancyConflict = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "vacancy_conflict",
        "Не удалось удалить вакансию из-за конфликта данных.");

    private static readonly ApiProblemDescriptor VacancyStatusForbidden = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "vacancy_status_forbidden",
        "У вас нет доступа к смене статуса этой вакансии.");

    private static readonly ApiProblemDescriptor VacancyStatusTransitionInvalid = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "vacancy_status_transition_invalid",
        "Недопустимый переход статуса вакансии.");

    private static readonly ApiProblemDescriptor VacancyStatusConflict = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "vacancy_status_conflict",
        "Не удалось изменить статус вакансии из-за конфликта данных.");

    private static readonly ApiProblemDescriptor VacancyNotPublished = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "vacancy_not_published",
        "Операция доступна только для опубликованной вакансии.");

    private static readonly ApiProblemDescriptor CandidateResumeCreateForbidden = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "candidate_resume_create_forbidden",
        "У вас нет доступа к добавлению кандидата в эту вакансию.");

    private static readonly ApiProblemDescriptor CandidateAlreadyExists = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "candidate_already_exists",
        "Кандидат с такими идентификационными данными уже существует.");

    private static readonly ApiProblemDescriptor CandidateResumeConflict = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "candidate_resume_conflict",
        "Не удалось добавить кандидата из-за конфликта данных.");

    private static readonly ApiProblemDescriptor CandidateResumeInvalidInput = new(
        StatusCodes.Status400BadRequest,
        "Ошибка валидации",
        "candidate_resume_invalid_input",
        "Некорректные данные кандидата или резюме.");

    private static readonly ApiProblemDescriptor CandidateLinkForbidden = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "candidate_link_forbidden",
        "У вас нет доступа к добавлению кандидата из базы в эту вакансию.");

    private static readonly ApiProblemDescriptor CandidateNotFound = new(
        StatusCodes.Status404NotFound,
        "Не найдено",
        "candidate_not_found",
        "Кандидат из системной базы не найден.");

    private static readonly ApiProblemDescriptor CandidateLinkConflict = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "candidate_link_conflict",
        "Не удалось добавить кандидата в вакансию из-за конфликта данных.");

    private static readonly ApiProblemDescriptor CandidateStageForbidden = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "candidate_stage_forbidden",
        "У вас нет доступа к смене стадии кандидата в этой вакансии.");

    private static readonly ApiProblemDescriptor CandidateLinkNotFound = new(
        StatusCodes.Status404NotFound,
        "Не найдено",
        "vacancy_candidate_not_found",
        "Кандидат не найден в pipeline этой вакансии.");

    private static readonly ApiProblemDescriptor CandidateStageInvalid = new(
        StatusCodes.Status400BadRequest,
        "Ошибка валидации",
        "vacancy_candidate_stage_invalid",
        "Некорректное значение стадии. Допустимо: Pool или Shortlist.");

    private static readonly ApiProblemDescriptor CandidateStageConflict = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "vacancy_candidate_stage_conflict",
        "Не удалось изменить стадию кандидата из-за ограничения инвариантов.");

    private static readonly ApiProblemDescriptor CandidateSelectForbidden = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "candidate_select_forbidden",
        "У вас нет доступа к финальному выбору кандидата в этой вакансии.");

    private static readonly ApiProblemDescriptor CandidateNotInShortlist = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "candidate_not_in_shortlist",
        "Кандидат не находится в shortlist этой вакансии.");

    private static readonly ApiProblemDescriptor CandidateSelectConflict = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "candidate_select_conflict",
        "Финальный кандидат уже выбран и не может быть изменен в текущем процессе.");

    private static readonly ApiProblemDescriptor SelectedCandidateContactsForbidden = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "selected_candidate_contacts_forbidden",
        "У вас нет доступа к контактам выбранного кандидата в этой вакансии.");

    private static readonly ApiProblemDescriptor CandidateNotSelected = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "candidate_not_selected",
        "Финальный кандидат по вакансии еще не выбран.");

    private static readonly ApiProblemDescriptor SelectedCandidateNotFound = new(
        StatusCodes.Status404NotFound,
        "Не найдено",
        "selected_candidate_not_found",
        "Выбранный кандидат не найден.");

    private static readonly ApiProblemDescriptor VacancyCandidateContactsForbidden = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "vacancy_candidate_contacts_forbidden",
        "У вас нет доступа к контактам кандидата в этой вакансии.");

    private static readonly ApiProblemDescriptor VacancyCandidateContactsDenied = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "vacancy_candidate_contacts_access_denied",
        "Срок доступа к контактам кандидата истек или вы не являетесь владельцем контактов.");

    private static readonly ApiProblemDescriptor VacancyCandidatesReadForbidden = new(
        StatusCodes.Status403Forbidden,
        "Доступ запрещен",
        "vacancy_candidates_forbidden",
        "У вас нет доступа к списку кандидатов этой вакансии.");

    public static ApiProblemDescriptor Resolve(CreateVacancyErrorCode errorCode)
    {
        return errorCode switch
        {
            CreateVacancyErrorCode.OrderNotFound => OrderNotFound,
            CreateVacancyErrorCode.Forbidden => VacancyCreateForbidden,
            _ => CreateVacancyConflict
        };
    }

    public static ApiProblemDescriptor Resolve(GetVacancyByIdErrorCode errorCode)
    {
        return errorCode switch
        {
            GetVacancyByIdErrorCode.NotFound => VacancyNotFound,
            _ => VacancyAccessForbidden
        };
    }

    public static ApiProblemDescriptor Resolve(GetVacanciesErrorCode errorCode)
    {
        return errorCode switch
        {
            GetVacanciesErrorCode.Forbidden => VacancyListAccessForbidden,
            _ => VacancyListAccessForbidden
        };
    }

    public static ApiProblemDescriptor Resolve(UpdateVacancyErrorCode errorCode)
    {
        return errorCode switch
        {
            UpdateVacancyErrorCode.NotFound => VacancyNotFound,
            UpdateVacancyErrorCode.Forbidden => VacancyAccessForbidden,
            _ => UpdateVacancyConflict
        };
    }

    public static ApiProblemDescriptor Resolve(DeleteVacancyErrorCode errorCode)
    {
        return errorCode switch
        {
            DeleteVacancyErrorCode.NotFound => VacancyNotFound,
            DeleteVacancyErrorCode.Forbidden => VacancyAccessForbidden,
            _ => DeleteVacancyConflict
        };
    }

    public static ApiProblemDescriptor Resolve(UpdateVacancyStatusErrorCode errorCode)
    {
        return errorCode switch
        {
            UpdateVacancyStatusErrorCode.NotFound => VacancyNotFound,
            UpdateVacancyStatusErrorCode.Forbidden => VacancyStatusForbidden,
            UpdateVacancyStatusErrorCode.InvalidTransition => VacancyStatusTransitionInvalid,
            _ => VacancyStatusConflict
        };
    }

    public static ApiProblemDescriptor Resolve(CreateCandidateResumeErrorCode errorCode)
    {
        return errorCode switch
        {
            CreateCandidateResumeErrorCode.VacancyNotFound => VacancyNotFound,
            CreateCandidateResumeErrorCode.Forbidden => CandidateResumeCreateForbidden,
            CreateCandidateResumeErrorCode.CandidateAlreadyExists => CandidateAlreadyExists,
            CreateCandidateResumeErrorCode.InvalidInput => CandidateResumeInvalidInput,
            CreateCandidateResumeErrorCode.VacancyNotPublished => VacancyNotPublished,
            _ => CandidateResumeConflict
        };
    }

    public static ApiProblemDescriptor Resolve(AddCandidateFromBaseErrorCode errorCode)
    {
        return errorCode switch
        {
            AddCandidateFromBaseErrorCode.VacancyNotFound => VacancyNotFound,
            AddCandidateFromBaseErrorCode.CandidateNotFound => CandidateNotFound,
            AddCandidateFromBaseErrorCode.Forbidden => CandidateLinkForbidden,
            AddCandidateFromBaseErrorCode.VacancyNotPublished => VacancyNotPublished,
            _ => CandidateLinkConflict
        };
    }

    public static ApiProblemDescriptor Resolve(UpdateVacancyCandidateStageErrorCode errorCode)
    {
        return errorCode switch
        {
            UpdateVacancyCandidateStageErrorCode.VacancyNotFound => VacancyNotFound,
            UpdateVacancyCandidateStageErrorCode.CandidateLinkNotFound => CandidateLinkNotFound,
            UpdateVacancyCandidateStageErrorCode.Forbidden => CandidateStageForbidden,
            UpdateVacancyCandidateStageErrorCode.InvalidStage => CandidateStageInvalid,
            UpdateVacancyCandidateStageErrorCode.VacancyNotPublished => VacancyNotPublished,
            _ => CandidateStageConflict
        };
    }

    public static ApiProblemDescriptor Resolve(SelectVacancyCandidateErrorCode errorCode)
    {
        return errorCode switch
        {
            SelectVacancyCandidateErrorCode.VacancyNotFound => VacancyNotFound,
            SelectVacancyCandidateErrorCode.Forbidden => CandidateSelectForbidden,
            SelectVacancyCandidateErrorCode.CandidateNotInShortlist => CandidateNotInShortlist,
            SelectVacancyCandidateErrorCode.VacancyNotPublished => VacancyNotPublished,
            _ => CandidateSelectConflict
        };
    }

    public static ApiProblemDescriptor Resolve(GetSelectedCandidateContactsErrorCode errorCode)
    {
        return errorCode switch
        {
            GetSelectedCandidateContactsErrorCode.VacancyNotFound => VacancyNotFound,
            GetSelectedCandidateContactsErrorCode.Forbidden => SelectedCandidateContactsForbidden,
            GetSelectedCandidateContactsErrorCode.CandidateNotSelected => CandidateNotSelected,
            GetSelectedCandidateContactsErrorCode.CandidateNotFound => SelectedCandidateNotFound,
            _ => CandidateSelectConflict
        };
    }

    public static ApiProblemDescriptor Resolve(GetVacancyCandidateContactsForExecutorErrorCode errorCode)
    {
        return errorCode switch
        {
            GetVacancyCandidateContactsForExecutorErrorCode.VacancyNotFound => VacancyNotFound,
            GetVacancyCandidateContactsForExecutorErrorCode.CandidateLinkNotFound => CandidateLinkNotFound,
            GetVacancyCandidateContactsForExecutorErrorCode.Forbidden => VacancyCandidateContactsForbidden,
            GetVacancyCandidateContactsForExecutorErrorCode.ContactsAccessDenied => VacancyCandidateContactsDenied,
            _ => VacancyCandidateContactsDenied
        };
    }

    public static ApiProblemDescriptor Resolve(GetVacancyCandidatesErrorCode errorCode)
    {
        return errorCode switch
        {
            GetVacancyCandidatesErrorCode.VacancyNotFound => VacancyNotFound,
            _ => VacancyCandidatesReadForbidden
        };
    }
}
