using Microsoft.Extensions.DependencyInjection;
using SelectProfi.backend.Application.Auth.Login;
using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Profile.GetMyProfile;
using SelectProfi.backend.Application.Profile.SwitchMyActiveRole;
using SelectProfi.backend.Application.Profile.UpdateMyProfile;

namespace SelectProfi.backend.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationLayer(this IServiceCollection services)
    {
        services.AddScoped<ICommandDispatcher>(serviceProvider => new CommandDispatcher(serviceProvider.GetService));
        services.AddScoped<IQueryDispatcher>(serviceProvider => new QueryDispatcher(serviceProvider.GetService));
        services.AddScoped<ICommandHandler<RegisterUserCommand, RegisterUserResult>, RegisterUserCommandHandler>();
        services.AddScoped<ICommandHandler<LoginUserCommand, LoginUserResult>, LoginUserCommandHandler>();
        services.AddScoped<ICommandHandler<RefreshAuthSessionCommand, RefreshAuthSessionResult>, RefreshAuthSessionCommandHandler>();
        services.AddScoped<IQueryHandler<GetMyProfileQuery, GetMyProfileResult>, GetMyProfileQueryHandler>();
        services.AddScoped<ICommandHandler<SwitchMyActiveRoleCommand, SwitchMyActiveRoleResult>, SwitchMyActiveRoleCommandHandler>();
        services.AddScoped<ICommandHandler<UpdateMyProfileCommand, UpdateMyProfileResult>, UpdateMyProfileCommandHandler>();
        return services;
    }
}
