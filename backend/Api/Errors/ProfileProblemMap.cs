using SelectProfi.backend.Application.Profile.GetMyProfile;
using SelectProfi.backend.Application.Profile.SwitchMyActiveRole;
using SelectProfi.backend.Application.Profile.UpdateMyProfile;

namespace SelectProfi.backend.Errors;

public static class ProfileProblemMap
{
    private static readonly ApiProblemDescriptor UserNotFound = new(
        StatusCodes.Status404NotFound,
        "Не найдено",
        "user_not_found",
        "Профиль пользователя не найден.");

    private static readonly ApiProblemDescriptor InvalidRoleSpecificPayload = new(
        StatusCodes.Status400BadRequest,
        "Некорректный запрос",
        "invalid_role_specific_profile_payload",
        "Ролевые данные профиля некорректны для текущей роли пользователя.");

    private static readonly ApiProblemDescriptor ActiveRoleNotAllowed = new(
        StatusCodes.Status400BadRequest,
        "Некорректный запрос",
        "active_role_not_allowed",
        "Запрошенная активная роль недоступна текущему пользователю.");

    private static readonly ApiProblemDescriptor ProfileConflict = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "profile_conflict",
        "Произошел конфликт при обновлении профиля.");

    private static readonly ApiProblemDescriptor PhoneAlreadyExists = new(
        StatusCodes.Status409Conflict,
        "Конфликт",
        "phone_already_exists",
        "Телефон уже зарегистрирован.");

    public static ApiProblemDescriptor Resolve(GetMyProfileErrorCode errorCode)
    {
        return errorCode switch
        {
            GetMyProfileErrorCode.UserNotFound => UserNotFound,
            _ => UserNotFound
        };
    }

    public static ApiProblemDescriptor Resolve(UpdateMyProfileErrorCode errorCode)
    {
        return errorCode switch
        {
            UpdateMyProfileErrorCode.UserNotFound => UserNotFound,
            UpdateMyProfileErrorCode.InvalidRoleSpecificPayload => InvalidRoleSpecificPayload,
            _ => PhoneAlreadyExists
        };
    }

    public static ApiProblemDescriptor Resolve(SwitchMyActiveRoleErrorCode errorCode)
    {
        return errorCode switch
        {
            SwitchMyActiveRoleErrorCode.UserNotFound => UserNotFound,
            SwitchMyActiveRoleErrorCode.ActiveRoleNotAllowed => ActiveRoleNotAllowed,
            _ => ProfileConflict
        };
    }
}
