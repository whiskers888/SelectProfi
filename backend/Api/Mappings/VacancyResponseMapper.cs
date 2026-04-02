using SelectProfi.backend.Application.Vacancies.CreateVacancy;
using SelectProfi.backend.Application.Vacancies.GetVacancies;
using SelectProfi.backend.Application.Vacancies.GetVacancyById;
using SelectProfi.backend.Application.Vacancies.UpdateVacancy;
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
                CreatedAtUtc = item.CreatedAtUtc,
                UpdatedAtUtc = item.UpdatedAtUtc
            }).ToArray(),
            Limit = result.Limit,
            Offset = result.Offset
        };
    }
}
