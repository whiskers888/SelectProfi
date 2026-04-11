using SelectProfi.backend.Application.Vacancies.CreateVacancy;
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
using SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;
using SelectProfi.backend.Application.Candidates.UpdateVacancyCandidateStage;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Contracts.Vacancies;

namespace SelectProfi.backend.Mappings;

public static class VacancyResponseMapper
{
    public static VacancyResponse ToResponse(this CreateVacancyResult result)
    {
        return new VacancyResponse
        {
            Id = result.VacancyId,
            OrderId = result.OrderId,
            CustomerId = result.CustomerId,
            ExecutorId = result.ExecutorId,
            Title = result.Title,
            Description = result.Description,
            Status = MapStatus(result.Status),
            CreatedAtUtc = result.CreatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc
        };
    }

    public static VacancyResponse ToResponse(this GetVacancyByIdResult result)
    {
        return new VacancyResponse
        {
            Id = result.VacancyId,
            OrderId = result.OrderId,
            CustomerId = result.CustomerId,
            ExecutorId = result.ExecutorId,
            Title = result.Title,
            Description = result.Description,
            Status = MapStatus(result.Status),
            CreatedAtUtc = result.CreatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc
        };
    }

    public static VacancyResponse ToResponse(this UpdateVacancyResult result)
    {
        return new VacancyResponse
        {
            Id = result.VacancyId,
            OrderId = result.OrderId,
            CustomerId = result.CustomerId,
            ExecutorId = result.ExecutorId,
            Title = result.Title,
            Description = result.Description,
            Status = MapStatus(result.Status),
            CreatedAtUtc = result.CreatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc
        };
    }

    public static VacancyListResponse ToResponse(this GetVacanciesResult result)
    {
        return new VacancyListResponse
        {
            Items = result.Items.Select(item => new VacancyResponse
            {
                Id = item.VacancyId,
                OrderId = item.OrderId,
                CustomerId = item.CustomerId,
                ExecutorId = item.ExecutorId,
                Title = item.Title,
                Description = item.Description,
                Status = MapStatus(item.Status),
                CreatedAtUtc = item.CreatedAtUtc,
                UpdatedAtUtc = item.UpdatedAtUtc
            }).ToArray(),
            Limit = result.Limit,
            Offset = result.Offset
        };
    }

    public static CandidateResumeResponse ToResponse(this CreateCandidateResumeResult result)
    {
        return new CandidateResumeResponse
        {
            CandidateId = result.CandidateId,
            CandidateResumeId = result.CandidateResumeId,
            VacancyCandidateId = result.VacancyCandidateId,
            PublicAlias = result.PublicAlias,
            ContactsAccessExpiresAtUtc = result.ContactsAccessExpiresAtUtc
        };
    }

    public static VacancyCandidateResponse ToResponse(this AddCandidateFromBaseResult result)
    {
        return new VacancyCandidateResponse
        {
            VacancyCandidateId = result.VacancyCandidateId,
            VacancyId = result.VacancyId,
            CandidateId = result.CandidateId,
            Stage = result.Stage.ToString(),
            AddedAtUtc = result.AddedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc
        };
    }

    public static VacancyResponse ToResponse(this UpdateVacancyStatusResult result)
    {
        return new VacancyResponse
        {
            Id = result.VacancyId,
            OrderId = result.OrderId,
            CustomerId = result.CustomerId,
            ExecutorId = result.ExecutorId,
            Title = result.Title,
            Description = result.Description,
            Status = MapStatus(result.Status),
            CreatedAtUtc = result.CreatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc
        };
    }

    public static VacancyCandidateResponse ToResponse(this UpdateVacancyCandidateStageResult result)
    {
        return new VacancyCandidateResponse
        {
            VacancyCandidateId = result.VacancyCandidateId,
            VacancyId = result.VacancyId,
            CandidateId = result.CandidateId,
            Stage = result.Stage.ToString(),
            AddedAtUtc = result.AddedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc
        };
    }

    public static SelectedVacancyCandidateResponse ToResponse(this SelectVacancyCandidateResult result)
    {
        return new SelectedVacancyCandidateResponse
        {
            VacancyId = result.VacancyId,
            SelectedCandidateId = result.SelectedCandidateId,
            UpdatedAtUtc = result.UpdatedAtUtc
        };
    }

    public static SelectedCandidateContactsResponse ToResponse(this GetSelectedCandidateContactsResult result)
    {
        return new SelectedCandidateContactsResponse
        {
            VacancyId = result.VacancyId,
            CandidateId = result.CandidateId,
            FullName = result.FullName,
            Email = result.Email,
            Phone = result.Phone
        };
    }

    public static ExecutorCandidateContactsResponse ToResponse(this GetVacancyCandidateContactsForExecutorResult result)
    {
        return new ExecutorCandidateContactsResponse
        {
            VacancyId = result.VacancyId,
            CandidateId = result.CandidateId,
            FullName = result.FullName,
            Email = result.Email,
            Phone = result.Phone,
            ContactsAccessExpiresAtUtc = result.ContactsAccessExpiresAtUtc
        };
    }

    public static VacancyCandidatesResponse ToResponse(this GetVacancyCandidatesResult result)
    {
        return new VacancyCandidatesResponse
        {
            VacancyId = result.VacancyId,
            SelectedCandidateId = result.SelectedCandidateId,
            Items = result.Items.Select(item => new VacancyCandidatesItemResponse
            {
                VacancyCandidateId = item.VacancyCandidateId,
                CandidateId = item.CandidateId,
                PublicAlias = item.PublicAlias,
                Stage = item.Stage.ToString(),
                AddedAtUtc = item.AddedAtUtc,
                UpdatedAtUtc = item.UpdatedAtUtc,
                ViewedByCustomerAtUtc = item.ViewedByCustomerAtUtc,
                IsSelected = item.IsSelected
            }).ToArray()
        };
    }

    public static VacancyBaseCandidatesResponse ToResponse(this GetVacancyBaseCandidatesResult result)
    {
        return new VacancyBaseCandidatesResponse
        {
            VacancyId = result.VacancyId,
            Items = result.Items.Select(item => new VacancyBaseCandidatesItemResponse
            {
                CandidateId = item.CandidateId,
                PublicAlias = item.PublicAlias,
                UpdatedAtUtc = item.UpdatedAtUtc
            }).ToArray()
        };
    }

    private static VacancyStatusContract MapStatus(VacancyStatus status)
    {
        return status switch
        {
            VacancyStatus.Draft => VacancyStatusContract.Draft,
            VacancyStatus.OnApproval => VacancyStatusContract.OnApproval,
            VacancyStatus.Published => VacancyStatusContract.Published,
            _ => throw new ArgumentOutOfRangeException(nameof(status), status, "Unsupported vacancy status.")
        };
    }
}
