using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Controllers;

public abstract class AuthorizedControllerBase : ControllerBase
{
    private RequesterContext? _requesterContext;

    // @dvnull: Кэшируем requester-контекст на время запроса, чтобы не повторять получение claims в каждом action.
    protected RequesterContext RequesterContext => _requesterContext ??= User.GetRequiredRequesterContext();

    protected Guid RequesterUserId => RequesterContext.UserId;

    protected UserRole RequesterRole => RequesterContext.Role;
}
