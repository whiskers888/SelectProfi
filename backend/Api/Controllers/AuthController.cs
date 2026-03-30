using System.Diagnostics;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SelectProfi.backend.Application.Auth.Login;
using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Configuration;
using SelectProfi.backend.Contracts.Auth;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Mappings;

namespace SelectProfi.backend.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    IOptions<AuthFeatureFlagsOptions> authFeatureFlagsOptions,
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
                "Email is already registered.",
                "email")),
            RegisterUserErrorCode.PhoneAlreadyExists => Conflict(CreateConflictProblem(
                "phone_already_exists",
                "Phone is already registered.",
                "phone")),
            _ => Conflict(CreateConflictProblem("user_already_exists", "User already exists."))
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
            request.ToCommand(),
            cancellationToken);

        if (result.ErrorCode == LoginUserErrorCode.InvalidCredentials)
            return Unauthorized(CreateUnauthorizedProblem("invalid_credentials", "Invalid email or password."));

        return Ok(result.ToResponse());
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
            request.ToCommand(),
            cancellationToken);

        if (result.ErrorCode == RefreshAuthSessionErrorCode.InvalidRefreshToken)
            return Unauthorized(CreateUnauthorizedProblem("invalid_refresh_token", "Invalid refresh token."));

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
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(role))
            return Unauthorized(CreateUnauthorizedProblem("invalid_access_token", "Invalid access token."));

        return Ok(new
        {
            userId,
            email,
            role
        });
    }

    [Authorize(Roles = nameof(UserRole.Customer))]
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
            Title = "Conflict",
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

    private ProblemDetails CreateUnauthorizedProblem(string code, string detail)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://httpstatuses.com/401",
            Title = "Unauthorized",
            Status = StatusCodes.Status401Unauthorized,
            Detail = detail,
            Instance = HttpContext.Request.Path
        };

        problemDetails.Extensions["code"] = code;
        problemDetails.Extensions["traceId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;

        return problemDetails;
    }
}
