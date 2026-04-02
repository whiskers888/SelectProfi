using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Application.Vacancies.CreateVacancy;
using SelectProfi.backend.Application.Vacancies.DeleteVacancy;
using SelectProfi.backend.Application.Vacancies.GetVacancies;
using SelectProfi.backend.Application.Vacancies.GetVacancyById;
using SelectProfi.backend.Application.Vacancies.UpdateVacancy;
using SelectProfi.backend.Mappings;

namespace SelectProfi.backend.Errors;

public static class VacanciesActionResultExtensions
{
    public static IActionResult ToActionResult(this CreateVacancyResult result, ControllerBase controller)
    {
        if (result.ErrorCode == CreateVacancyErrorCode.None)
            return controller.Created($"/api/vacancies/{result.VacancyId}", result.ToResponse());

        return controller.ToProblem(VacanciesProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this GetVacancyByIdResult result, ControllerBase controller)
    {
        if (result.ErrorCode == GetVacancyByIdErrorCode.None)
            return controller.Ok(result.ToResponse());

        return controller.ToProblem(VacanciesProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this GetVacanciesResult result, ControllerBase controller)
    {
        if (result.ErrorCode == GetVacanciesErrorCode.None)
            return controller.Ok(result.ToResponse());

        return controller.ToProblem(VacanciesProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this UpdateVacancyResult result, ControllerBase controller)
    {
        if (result.ErrorCode == UpdateVacancyErrorCode.None)
            return controller.Ok(result.ToResponse());

        return controller.ToProblem(VacanciesProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this DeleteVacancyResult result, ControllerBase controller)
    {
        if (result.ErrorCode == DeleteVacancyErrorCode.None)
            return controller.NoContent();

        return controller.ToProblem(VacanciesProblemMap.Resolve(result.ErrorCode));
    }
}
