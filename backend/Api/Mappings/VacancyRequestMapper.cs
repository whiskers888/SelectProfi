using SelectProfi.backend.Application.Vacancies.CreateVacancy;
using SelectProfi.backend.Application.Vacancies.DeleteVacancy;
using SelectProfi.backend.Application.Vacancies.GetVacancies;
using SelectProfi.backend.Application.Vacancies.GetVacancyById;
using SelectProfi.backend.Application.Vacancies.UpdateVacancy;
using SelectProfi.backend.Application.Vacancies.UpdateVacancyStatus;
using SelectProfi.backend.Application.Candidates.AddCandidateFromBase;
using SelectProfi.backend.Application.Candidates.CreateCandidateResume;
using SelectProfi.backend.Application.Candidates.GetVacancyCandidateContactsForExecutor;
using SelectProfi.backend.Application.Candidates.GetVacancyBaseCandidates;
using SelectProfi.backend.Application.Candidates.GetVacancyCandidates;
using SelectProfi.backend.Application.Candidates.GetSelectedCandidateContacts;
using SelectProfi.backend.Application.Candidates.MarkVacancyCandidateViewedByCustomer;
using SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;
using SelectProfi.backend.Application.Candidates.UpdateVacancyCandidateStage;
using SelectProfi.backend.Contracts.Vacancies;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Mappings;

public static class VacancyRequestMapper
{
    public static CreateVacancyCommand ToCommand(
        this CreateVacancyRequest request,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new CreateVacancyCommand
        {
            OrderId = request.OrderId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole,
            Title = request.Title,
            Description = request.Description
        };
    }

    public static GetVacancyByIdQuery ToGetByIdQuery(this Guid vacancyId, Guid requesterUserId, UserRole requesterRole)
    {
        return new GetVacancyByIdQuery
        {
            VacancyId = vacancyId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static GetVacanciesQuery ToQuery(this GetVacanciesRequest request, Guid requesterUserId, UserRole requesterRole)
    {
        return new GetVacanciesQuery
        {
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole,
            Limit = request.Limit,
            Offset = request.Offset
        };
    }

    public static UpdateVacancyCommand ToCommand(
        this UpdateVacancyRequest request,
        Guid vacancyId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new UpdateVacancyCommand
        {
            VacancyId = vacancyId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole,
            Title = request.Title,
            Description = request.Description
        };
    }

    public static UpdateVacancyStatusCommand ToCommand(
        this UpdateVacancyStatusRequest request,
        Guid vacancyId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new UpdateVacancyStatusCommand
        {
            VacancyId = vacancyId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole,
            Status = MapStatus(request.Status)
        };
    }

    public static DeleteVacancyCommand ToDeleteVacancyCommand(this Guid vacancyId, Guid requesterUserId, UserRole requesterRole)
    {
        return new DeleteVacancyCommand
        {
            VacancyId = vacancyId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static CreateCandidateResumeCommand ToCommand(
        this CreateCandidateResumeRequest request,
        Guid vacancyId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new CreateCandidateResumeCommand
        {
            VacancyId = vacancyId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole,
            FullName = request.FullName,
            BirthDate = request.BirthDate,
            Email = request.Email,
            Phone = request.Phone,
            Specialization = request.Specialization,
            ResumeTitle = request.ResumeTitle,
            ResumeContentJson = request.ResumeContentJson,
            ResumeAttachmentsJson = request.ResumeAttachmentsJson
        };
    }

    public static AddCandidateFromBaseCommand ToCommand(
        this Guid candidateId,
        Guid vacancyId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new AddCandidateFromBaseCommand
        {
            VacancyId = vacancyId,
            CandidateId = candidateId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static UpdateVacancyCandidateStageCommand ToCommand(
        this UpdateVacancyCandidateStageRequest request,
        Guid vacancyId,
        Guid candidateId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new UpdateVacancyCandidateStageCommand
        {
            VacancyId = vacancyId,
            CandidateId = candidateId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole,
            Stage = request.Stage switch
            {
                VacancyCandidateStageContract.Pool => VacancyCandidateStage.Pool,
                VacancyCandidateStageContract.Shortlist => VacancyCandidateStage.Shortlist,
                _ => throw new ArgumentOutOfRangeException(nameof(request.Stage), request.Stage, "Unsupported stage.")
            }
        };
    }

    public static SelectVacancyCandidateCommand ToCommand(
        this SelectVacancyCandidateRequest request,
        Guid vacancyId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new SelectVacancyCandidateCommand
        {
            VacancyId = vacancyId,
            CandidateId = request.CandidateId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static MarkVacancyCandidateViewedByCustomerCommand ToMarkViewedByCustomerCommand(
        this Guid candidateId,
        Guid vacancyId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new MarkVacancyCandidateViewedByCustomerCommand
        {
            VacancyId = vacancyId,
            CandidateId = candidateId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static GetSelectedCandidateContactsQuery ToGetSelectedCandidateContactsQuery(
        this Guid vacancyId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new GetSelectedCandidateContactsQuery
        {
            VacancyId = vacancyId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static GetVacancyCandidateContactsForExecutorQuery ToGetVacancyCandidateContactsForExecutorQuery(
        this Guid candidateId,
        Guid vacancyId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new GetVacancyCandidateContactsForExecutorQuery
        {
            VacancyId = vacancyId,
            CandidateId = candidateId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static GetVacancyCandidatesQuery ToGetVacancyCandidatesQuery(
        this Guid vacancyId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new GetVacancyCandidatesQuery
        {
            VacancyId = vacancyId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static GetVacancyBaseCandidatesQuery ToGetVacancyBaseCandidatesQuery(
        this Guid vacancyId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new GetVacancyBaseCandidatesQuery
        {
            VacancyId = vacancyId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    private static VacancyStatus MapStatus(VacancyStatusContract status)
    {
        return status switch
        {
            VacancyStatusContract.Draft => VacancyStatus.Draft,
            VacancyStatusContract.OnApproval => VacancyStatus.OnApproval,
            VacancyStatusContract.Published => VacancyStatus.Published,
            _ => throw new ArgumentOutOfRangeException(nameof(status), status, "Unsupported vacancy status.")
        };
    }
}
