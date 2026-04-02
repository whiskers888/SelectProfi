using SelectProfi.backend.Application.Vacancies.CreateVacancy;
using SelectProfi.backend.Application.Vacancies.DeleteVacancy;
using SelectProfi.backend.Application.Vacancies.GetVacancies;
using SelectProfi.backend.Application.Vacancies.GetVacancyById;
using SelectProfi.backend.Application.Vacancies.UpdateVacancy;
using SelectProfi.backend.Contracts.Vacancies;
using SelectProfi.backend.Domain.Users;

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

    public static DeleteVacancyCommand ToDeleteVacancyCommand(this Guid vacancyId, Guid requesterUserId, UserRole requesterRole)
    {
        return new DeleteVacancyCommand
        {
            VacancyId = vacancyId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }
}
