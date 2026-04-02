using Microsoft.Extensions.DependencyInjection;
using SelectProfi.backend.Application.Auth.Login;
using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Orders.CreateOrder;
using SelectProfi.backend.Application.Orders.DeleteOrder;
using SelectProfi.backend.Application.Orders.GetOrderById;
using SelectProfi.backend.Application.Orders.GetOrders;
using SelectProfi.backend.Application.Orders.UpdateOrder;
using SelectProfi.backend.Application.Profile.GetMyProfile;
using SelectProfi.backend.Application.Profile.SwitchMyActiveRole;
using SelectProfi.backend.Application.Profile.UpdateMyProfile;
using SelectProfi.backend.Application.Vacancies.CreateVacancy;
using SelectProfi.backend.Application.Vacancies.DeleteVacancy;
using SelectProfi.backend.Application.Vacancies.GetVacancies;
using SelectProfi.backend.Application.Vacancies.GetVacancyById;
using SelectProfi.backend.Application.Vacancies.UpdateVacancy;

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
        services.AddScoped<ICommandHandler<CreateOrderCommand, CreateOrderResult>, CreateOrderCommandHandler>();
        services.AddScoped<ICommandHandler<UpdateOrderCommand, UpdateOrderResult>, UpdateOrderCommandHandler>();
        services.AddScoped<ICommandHandler<DeleteOrderCommand, DeleteOrderResult>, DeleteOrderCommandHandler>();
        services.AddScoped<ICommandHandler<CreateVacancyCommand, CreateVacancyResult>, CreateVacancyCommandHandler>();
        services.AddScoped<ICommandHandler<UpdateVacancyCommand, UpdateVacancyResult>, UpdateVacancyCommandHandler>();
        services.AddScoped<ICommandHandler<DeleteVacancyCommand, DeleteVacancyResult>, DeleteVacancyCommandHandler>();
        services.AddScoped<IQueryHandler<GetOrderByIdQuery, GetOrderByIdResult>, GetOrderByIdQueryHandler>();
        services.AddScoped<IQueryHandler<GetOrdersQuery, GetOrdersResult>, GetOrdersQueryHandler>();
        services.AddScoped<IQueryHandler<GetVacancyByIdQuery, GetVacancyByIdResult>, GetVacancyByIdQueryHandler>();
        services.AddScoped<IQueryHandler<GetVacanciesQuery, GetVacanciesResult>, GetVacanciesQueryHandler>();
        services.AddScoped<IQueryHandler<GetMyProfileQuery, GetMyProfileResult>, GetMyProfileQueryHandler>();
        services.AddScoped<ICommandHandler<SwitchMyActiveRoleCommand, SwitchMyActiveRoleResult>, SwitchMyActiveRoleCommandHandler>();
        services.AddScoped<ICommandHandler<UpdateMyProfileCommand, UpdateMyProfileResult>, UpdateMyProfileCommandHandler>();
        return services;
    }
}
