using SelectProfi.backend.Application.Vacancies.CreateVacancy;
using SelectProfi.backend.Application.Vacancies.DeleteVacancy;
using SelectProfi.backend.Application.Vacancies.GetVacancies;
using SelectProfi.backend.Application.Vacancies.GetVacancyById;
using SelectProfi.backend.Application.Vacancies.UpdateVacancy;

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
}
