using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Authentication;

public readonly record struct RequesterContext(Guid UserId, UserRole Role);
