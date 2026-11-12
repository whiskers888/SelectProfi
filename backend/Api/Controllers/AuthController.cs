using System.Diagnostics;
using System.Security.Claims;
using Api.Mappings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SelectProfi.backend.Application.Auth.Login;
using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Application.Auth.Verification;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Configuration;
using SelectProfi.backend.Contracts.Auth;
using SelectProfi.backend.Mappings;

namespace Api.Controllers;

[ApiController]
[Route("api/auth")]
// @dvnull: Сообщения ProblemDetails переведены на русский для корректного отображения на фронтенде.
public sealed class AuthController(
    IOptions<AuthFeatureFlagsOptions> authFeatureFlagsOptions,
    IHostEnvironment hostEnvironment,
    ICommandDispatcher commandDispatcher) : ControllerBase
{
    [HttpPost("register")]
    [Produces("application/json", "application/problem+json")]
    [ProducesResponseType(typeof(RegisterUserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterUserRequest request,
        CancellationToken cancellationToken)
    {
        var featureFlags = authFeatureFlagsOptions.Value;
        var result = await commandDispatcher.DispatchAsync<RegisterUserCommand, RegisterUserResult>(
            request.ToCommand(featureFlags),
            cancellationToken);

        return result.ErrorCode switch
        {
            RegisterUserErrorCode.None => Ok(result.ToResponse()),
            RegisterUserErrorCode.EmailAlreadyExists => Conflict(CreateConflictProblem(
                "email_already_exists",
                "Email уже зарегистрирован.",
                "email")),
            RegisterUserErrorCode.PhoneAlreadyExists => Conflict(CreateConflictProblem(
                "phone_already_exists",
                "Телефон уже зарегистрирован.",
                "phone")),
            RegisterUserErrorCode.IdentifierRequired => BadRequest(CreateBadRequestProblem(
                "auth_identifier_required",
                "Укажите email или телефон.")),
            RegisterUserErrorCode.VerificationTokenMismatch => BadRequest(CreateBadRequestProblem(
                "verification_token_mismatch",
                "Данные подтверждения не совпадают.")),
            RegisterUserErrorCode.VerificationRequired => BadRequest(CreateBadRequestProblem(
                "verification_required",
                "Подтвердите email или телефон перед регистрацией.")),
            _ => Conflict(CreateConflictProblem("user_already_exists", "Пользователь уже существует."))
        };
    }

    [HttpPost("login")]
    [Produces("application/json", "application/problem+json")]
    [ProducesResponseType(typeof(LoginUserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginUserRequest request,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<LoginUserCommand, LoginUserResult>(
            AuthRequestMapper.ToCommand(request),
            cancellationToken);

        if (result.ErrorCode == LoginUserErrorCode.InvalidCredentials)
            return Unauthorized(CreateUnauthorizedProblem("invalid_credentials", "Неверный email или пароль."));

        if (result.ErrorCode == LoginUserErrorCode.IdentifierRequired)
            return BadRequest(CreateBadRequestProblem("auth_identifier_required", "Укажите email или телефон."));

        return Ok(result.ToResponse());
    }

    [HttpPost("verification/send")]
    [Produces("application/json", "application/problem+json")]
    [ProducesResponseType(typeof(SendVerificationCodeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> SendVerificationCode(
        [FromBody] SendVerificationCodeRequest request,
        CancellationToken cancellationToken)
    {
        var isDevelopment = hostEnvironment.IsDevelopment();
        var result = await commandDispatcher.DispatchAsync<SendVerificationCodeCommand, SendVerificationCodeResult>(
            request.ToCommand(isDevelopment),
            cancellationToken);

        return result.ErrorCode switch
        {
            SendVerificationCodeErrorCode.None => Ok(result.ToResponse()),
            SendVerificationCodeErrorCode.InvalidTarget => BadRequest(CreateBadRequestProblem(
                "invalid_verification_target",
                "Некорректный адрес подтверждения.")),
            SendVerificationCodeErrorCode.ResendTooSoon => StatusCode(
                StatusCodes.Status429TooManyRequests,
                CreateTooManyRequestsProblem(
                    "verification_resend_too_soon",
                    "Код уже отправлен. Повторите попытку позже.")),
            SendVerificationCodeErrorCode.TargetAlreadyRegistered => Conflict(CreateConflictProblem(
                IsPhoneChannel(result) ? "phone_already_exists" : "email_already_exists",
                IsPhoneChannel(result) ? "Телефон уже зарегистрирован." : "Email уже зарегистрирован.",
                IsPhoneChannel(result) ? "phone" : "email")),
            _ => BadRequest(CreateBadRequestProblem(
                "invalid_verification_target",
                "Некорректный адрес подтверждения."))
        };
    }

    [HttpPost("verification/confirm")]
    [Produces("application/json", "application/problem+json")]
    [ProducesResponseType(typeof(ConfirmVerificationCodeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ConfirmVerificationCode(
        [FromBody] ConfirmVerificationCodeRequest request,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<ConfirmVerificationCodeCommand, ConfirmVerificationCodeResult>(
            request.ToCommand(hostEnvironment.IsDevelopment()),
            cancellationToken);

        return result.ErrorCode switch
        {
            ConfirmVerificationCodeErrorCode.None => Ok(result.ToResponse()),
            ConfirmVerificationCodeErrorCode.InvalidCode => BadRequest(CreateBadRequestProblem(
                "invalid_verification_code",
                $"Неверный код. Осталось {result.RemainingAttempts} попыток")),
            ConfirmVerificationCodeErrorCode.AttemptsExceeded => BadRequest(CreateBadRequestProblem(
                "verification_attempts_exceeded",
                "Превышено количество попыток. Запросите новый код.")),
            _ => BadRequest(CreateBadRequestProblem(
                "verification_challenge_expired",
                "Срок действия кода истёк. Запросите новый код."))
        };
    }

    [HttpPost("refresh")]
    [Produces("application/json", "application/problem+json")]
    [ProducesResponseType(typeof(RefreshTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh(
        [FromBody] RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<RefreshAuthSessionCommand, RefreshAuthSessionResult>(
            AuthRequestMapper.ToCommand(request),
            cancellationToken);

        if (result.ErrorCode == RefreshAuthSessionErrorCode.InvalidRefreshToken)
            return Unauthorized(CreateUnauthorizedProblem("invalid_refresh_token", "Недействительный refresh-токен."));

        return Ok(result.ToResponse());
    }

    [Authorize]
    [HttpGet("me")]
    [Produces("application/json", "application/problem+json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public IActionResult Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue(ClaimTypes.Email);
        var phone = User.FindFirstValue(ClaimTypes.MobilePhone);
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(role))
            return Unauthorized(CreateUnauthorizedProblem("invalid_access_token", "Недействительный токен доступа."));

        return Ok(new
        {
            userId,
            email,
            phone,
            role
        });
    }

    [Authorize(Policy = AuthorizationPolicies.CustomerOnly)]
    [HttpGet("customer-area")]
    [Produces("application/json", "application/problem+json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public IActionResult CustomerArea()
    {
        return Ok(new
        {
            status = "ok"
        });
    }

    private ProblemDetails CreateConflictProblem(string code, string detail, string? field = null)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://httpstatuses.com/409",
            Title = "Конфликт",
            Status = StatusCodes.Status409Conflict,
            Detail = detail,
            Instance = HttpContext.Request.Path
        };

        problemDetails.Extensions["code"] = code;
        problemDetails.Extensions["traceId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;

        if (field is not null)
        {
            problemDetails.Extensions["errors"] = new[]
            {
                new
                {
                    field,
                    message = detail,
                    code = "duplicate"
                }
            };
        }

        return problemDetails;
    }

    private static bool IsPhoneChannel(SendVerificationCodeResult result)
    {
        return string.Equals(result.Channel, "Phone", StringComparison.Ordinal);
    }

    private ProblemDetails CreateBadRequestProblem(string code, string detail)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://httpstatuses.com/400",
            Title = "Некорректный запрос",
            Status = StatusCodes.Status400BadRequest,
            Detail = detail,
            Instance = HttpContext.Request.Path
        };

        problemDetails.Extensions["code"] = code;
        problemDetails.Extensions["traceId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;

        return problemDetails;
    }

    private ProblemDetails CreateTooManyRequestsProblem(string code, string detail)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://httpstatuses.com/429",
            Title = "Слишком много запросов",
            Status = StatusCodes.Status429TooManyRequests,
            Detail = detail,
            Instance = HttpContext.Request.Path
        };

        problemDetails.Extensions["code"] = code;
        problemDetails.Extensions["traceId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;

        return problemDetails;
    }

    private ProblemDetails CreateUnauthorizedProblem(string code, string detail)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://httpstatuses.com/401",
            Title = "Не авторизован",
            Status = StatusCodes.Status401Unauthorized,
            Detail = detail,
            Instance = HttpContext.Request.Path
        };

        problemDetails.Extensions["code"] = code;
        problemDetails.Extensions["traceId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;

        return problemDetails;
    }
}
