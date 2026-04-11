using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Application.Candidates.AddCandidateFromBase;
using SelectProfi.backend.Application.Candidates.CreateCandidateResume;
using SelectProfi.backend.Application.Candidates.GetVacancyCandidateContactsForExecutor;
using SelectProfi.backend.Application.Candidates.GetVacancyBaseCandidates;
using SelectProfi.backend.Application.Candidates.GetVacancyCandidates;
using SelectProfi.backend.Application.Candidates.GetSelectedCandidateContacts;
using SelectProfi.backend.Application.Candidates.MarkVacancyCandidateViewedByCustomer;
using SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;
using SelectProfi.backend.Application.Candidates.UpdateVacancyCandidateStage;
using SelectProfi.backend.Application.Vacancies.CreateVacancy;
using SelectProfi.backend.Application.Vacancies.DeleteVacancy;
using SelectProfi.backend.Application.Vacancies.GetVacancies;
using SelectProfi.backend.Application.Vacancies.GetVacancyById;
using SelectProfi.backend.Application.Vacancies.UpdateVacancy;
using SelectProfi.backend.Application.Vacancies.UpdateVacancyStatus;
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

    public static IActionResult ToActionResult(this UpdateVacancyStatusResult result, ControllerBase controller)
    {
        if (result.ErrorCode == UpdateVacancyStatusErrorCode.None)
            return controller.Ok(result.ToResponse());

        return controller.ToProblem(VacanciesProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this CreateCandidateResumeResult result, ControllerBase controller)
    {
        if (result.ErrorCode == CreateCandidateResumeErrorCode.None)
            return controller.Created($"/api/candidates/{result.CandidateId}/resume", result.ToResponse());

        return controller.ToProblem(VacanciesProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this AddCandidateFromBaseResult result, ControllerBase controller)
    {
        if (result.ErrorCode == AddCandidateFromBaseErrorCode.None)
            return controller.Created(
                $"/api/vacancies/{result.VacancyId}/candidates/{result.CandidateId}",
                result.ToResponse());

        return controller.ToProblem(VacanciesProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this UpdateVacancyCandidateStageResult result, ControllerBase controller)
    {
        if (result.ErrorCode == UpdateVacancyCandidateStageErrorCode.None)
            return controller.Ok(result.ToResponse());

        return controller.ToProblem(VacanciesProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this SelectVacancyCandidateResult result, ControllerBase controller)
    {
        if (result.ErrorCode == SelectVacancyCandidateErrorCode.None)
            return controller.Ok(result.ToResponse());

        return controller.ToProblem(VacanciesProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this GetSelectedCandidateContactsResult result, ControllerBase controller)
    {
        if (result.ErrorCode == GetSelectedCandidateContactsErrorCode.None)
            return controller.Ok(result.ToResponse());

        return controller.ToProblem(VacanciesProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this GetVacancyCandidateContactsForExecutorResult result, ControllerBase controller)
    {
        if (result.ErrorCode == GetVacancyCandidateContactsForExecutorErrorCode.None)
            return controller.Ok(result.ToResponse());

        return controller.ToProblem(VacanciesProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this GetVacancyCandidatesResult result, ControllerBase controller)
    {
        if (result.ErrorCode == GetVacancyCandidatesErrorCode.None)
            return controller.Ok(result.ToResponse());

        return controller.ToProblem(VacanciesProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(
        this MarkVacancyCandidateViewedByCustomerResult result,
        ControllerBase controller)
    {
        if (result.ErrorCode == MarkVacancyCandidateViewedByCustomerErrorCode.None)
            return controller.NoContent();

        return controller.ToProblem(VacanciesProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this GetVacancyBaseCandidatesResult result, ControllerBase controller)
    {
        if (result.ErrorCode == GetVacancyBaseCandidatesErrorCode.None)
            return controller.Ok(result.ToResponse());

        return controller.ToProblem(VacanciesProblemMap.Resolve(result.ErrorCode));
    }
}
