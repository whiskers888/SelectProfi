namespace SelectProfi.backend.Application.Auth.Register;

public interface IRegisterUserUseCase
{
    Task<RegisterUserResult> ExecuteAsync(RegisterUserCommand command, CancellationToken cancellationToken);
}
