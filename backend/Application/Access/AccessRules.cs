using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Access;

public static class OrderAccessRules
{
    public static bool CanReadOrder(
        UserRole requesterRole,
        Guid requesterUserId,
        Guid orderCustomerId,
        Guid? orderExecutorId)
    {
        return requesterRole switch
        {
            UserRole.Admin => true,
            UserRole.Customer => requesterUserId == orderCustomerId,
            UserRole.Executor => orderExecutorId == null || orderExecutorId == requesterUserId,
            _ => false
        };
    }

    public static bool CanReadOrders(UserRole requesterRole)
    {
        return requesterRole is UserRole.Customer or UserRole.Admin or UserRole.Executor;
    }

    public static bool CanManageOrder(UserRole requesterRole, Guid requesterUserId, Guid orderCustomerId)
    {
        return requesterRole switch
        {
            UserRole.Admin => true,
            UserRole.Customer => requesterUserId == orderCustomerId,
            _ => false
        };
    }
}

public static class VacancyAccessRules
{
    public static bool CanCreateVacancy(UserRole requesterRole, Guid requesterUserId, Guid? orderExecutorId)
    {
        return requesterRole == UserRole.Executor && orderExecutorId == requesterUserId;
    }

    public static bool CanManageVacancyByExecutor(UserRole requesterRole, Guid requesterUserId, Guid vacancyExecutorId)
    {
        return requesterRole == UserRole.Executor && requesterUserId == vacancyExecutorId;
    }

    public static bool CanReadVacancy(
        UserRole requesterRole,
        Guid requesterUserId,
        Guid customerId,
        Guid executorId,
        VacancyStatus vacancyStatus)
    {
        return requesterRole switch
        {
            UserRole.Admin => true,
            UserRole.Customer => requesterUserId == customerId,
            UserRole.Executor => requesterUserId == executorId,
            UserRole.Applicant => vacancyStatus == VacancyStatus.Published,
            _ => false
        };
    }

    public static bool CanReadVacancies(UserRole requesterRole)
    {
        return requesterRole is UserRole.Admin or UserRole.Customer or UserRole.Executor or UserRole.Applicant;
    }

    public static bool CanChangeVacancyStatus(
        UserRole requesterRole,
        Guid requesterUserId,
        Guid customerId,
        Guid executorId,
        VacancyStatus targetStatus)
    {
        return targetStatus switch
        {
            VacancyStatus.Draft or VacancyStatus.OnApproval
                => requesterRole == UserRole.Executor && requesterUserId == executorId,
            VacancyStatus.Published
                => requesterRole == UserRole.Customer && requesterUserId == customerId,
            _ => false
        };
    }

    public static bool IsVacancyStatusTransitionAllowed(VacancyStatus currentStatus, VacancyStatus targetStatus)
    {
        if (currentStatus == targetStatus)
            return true;

        return (currentStatus, targetStatus) switch
        {
            (VacancyStatus.Draft, VacancyStatus.OnApproval) => true,
            (VacancyStatus.OnApproval, VacancyStatus.Draft) => true,
            (VacancyStatus.OnApproval, VacancyStatus.Published) => true,
            _ => false
        };
    }
}

public static class CandidateAccessRules
{
    public static bool CanMutateVacancyCandidatePipeline(VacancyStatus vacancyStatus)
    {
        return vacancyStatus == VacancyStatus.Published;
    }

    public static bool CanManageVacancyCandidateByExecutor(UserRole requesterRole, Guid requesterUserId, Guid vacancyExecutorId)
    {
        return requesterRole == UserRole.Executor && requesterUserId == vacancyExecutorId;
    }

    public static bool CanSelectVacancyCandidateByCustomer(UserRole requesterRole, Guid requesterUserId, Guid vacancyCustomerId)
    {
        return requesterRole == UserRole.Customer && requesterUserId == vacancyCustomerId;
    }

    public static bool CanReadSelectedCandidateContactsByCustomer(UserRole requesterRole, Guid requesterUserId, Guid vacancyCustomerId)
    {
        return requesterRole == UserRole.Customer && requesterUserId == vacancyCustomerId;
    }
}
