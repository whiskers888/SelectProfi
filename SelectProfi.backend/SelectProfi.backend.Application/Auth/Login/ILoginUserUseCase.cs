namespace SelectProfi.backend.Application.Auth.Login;

public interface ILoginUserUseCase
{
    Task<LoginUserResult> ExecuteAsync(LoginUserCommand command, CancellationToken cancellationToken);
}
