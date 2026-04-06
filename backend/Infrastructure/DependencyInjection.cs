using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SelectProfi.backend.Application.Candidates.AddCandidateFromBase;
using SelectProfi.backend.Application.Candidates.GetVacancyCandidateContactsForExecutor;
using SelectProfi.backend.Application.Candidates.GetSelectedCandidateContacts;
using SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;
using SelectProfi.backend.Application.Candidates.UpdateVacancyCandidateStage;
using SelectProfi.backend.Application.Auth.Login;
using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Application.Candidates.CreateCandidateResume;
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
using SelectProfi.backend.Application.Vacancies.UpdateVacancyStatus;
using SelectProfi.backend.HealthChecks;
using SelectProfi.backend.Infrastructure.Auth.Login;
using SelectProfi.backend.Infrastructure.Auth.Refresh;
using SelectProfi.backend.Infrastructure.Auth.Register;
using SelectProfi.backend.Infrastructure.Candidates.AddCandidateFromBase;
using SelectProfi.backend.Infrastructure.Candidates.CreateCandidateResume;
using SelectProfi.backend.Infrastructure.Candidates.GetVacancyCandidateContactsForExecutor;
using SelectProfi.backend.Infrastructure.Candidates.GetSelectedCandidateContacts;
using SelectProfi.backend.Infrastructure.Candidates.SelectVacancyCandidate;
using SelectProfi.backend.Infrastructure.Candidates.UpdateVacancyCandidateStage;
using SelectProfi.backend.Infrastructure.Data;
using SelectProfi.backend.Infrastructure.Orders.CreateOrder;
using SelectProfi.backend.Infrastructure.Orders.DeleteOrder;
using SelectProfi.backend.Infrastructure.Orders.GetOrderById;
using SelectProfi.backend.Infrastructure.Orders.GetOrders;
using SelectProfi.backend.Infrastructure.Orders.UpdateOrder;
using SelectProfi.backend.Infrastructure.Profile.GetMyProfile;
using SelectProfi.backend.Infrastructure.Profile.UpdateMyProfile;
using SelectProfi.backend.Infrastructure.Vacancies.CreateVacancy;
using SelectProfi.backend.Infrastructure.Vacancies.DeleteVacancy;
using SelectProfi.backend.Infrastructure.Vacancies.GetVacancies;
using SelectProfi.backend.Infrastructure.Vacancies.GetVacancyById;
using SelectProfi.backend.Infrastructure.Vacancies.UpdateVacancy;
using SelectProfi.backend.Infrastructure.Vacancies.UpdateVacancyStatus;
using SelectProfi.backend.Security;

namespace SelectProfi.backend.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureLayer(this IServiceCollection services)
    {
        services.AddScoped<IPasswordHashingService, PasswordHashingService>();
        services.AddScoped<ITokenPairFactory, TokenPairFactory>();
        services.AddScoped<IPasswordHasher, RegisterPasswordHasherAdapter>();
        services.AddScoped<ITokenPairIssuer, RegisterTokenPairIssuerAdapter>();
        services.AddScoped<IRegisterUserPersistence, RegisterUserPersistence>();
        services.AddScoped<ILoginPasswordVerifier, LoginPasswordVerifierAdapter>();
        services.AddScoped<ILoginTokenPairIssuer, LoginTokenPairIssuerAdapter>();
        services.AddScoped<ILoginUserPersistence, LoginUserPersistence>();
        services.AddScoped<IRefreshTokenHasher, RefreshTokenHasherAdapter>();
        services.AddScoped<IRefreshTokenPairIssuer, RefreshTokenPairIssuerAdapter>();
        services.AddScoped<IRefreshAuthSessionPersistence, RefreshAuthSessionPersistence>();
        services.AddScoped<ICreateOrderPersistence, CreateOrderPersistence>();
        services.AddScoped<IGetOrderByIdPersistence, GetOrderByIdPersistence>();
        services.AddScoped<IGetOrdersPersistence, GetOrdersPersistence>();
        services.AddScoped<IUpdateOrderPersistence, UpdateOrderPersistence>();
        services.AddScoped<IDeleteOrderPersistence, DeleteOrderPersistence>();
        // @dvnull: Добавлена persistence-реализация для привязки кандидата из системной базы в pipeline вакансии.
        services.AddScoped<IAddCandidateFromBasePersistence, AddCandidateFromBasePersistence>();
        // @dvnull: Добавлена persistence-реализация для смены стадии кандидата в vacancy pipeline.
        services.AddScoped<IUpdateVacancyCandidateStagePersistence, UpdateVacancyCandidateStagePersistence>();
        // @dvnull: Добавлена persistence-реализация для финального выбора кандидата заказчиком.
        services.AddScoped<ISelectVacancyCandidatePersistence, SelectVacancyCandidatePersistence>();
        // @dvnull: Добавлена persistence-реализация чтения контактов кандидата для рекрутера с проверкой owner/TTL.
        services.AddScoped<IGetVacancyCandidateContactsForExecutorPersistence, GetVacancyCandidateContactsForExecutorPersistence>();
        // @dvnull: Добавлена persistence-реализация чтения контактов выбранного кандидата для заказчика.
        services.AddScoped<IGetSelectedCandidateContactsPersistence, GetSelectedCandidateContactsPersistence>();
        // @dvnull: Ранее infra-слой не умел сохранять связку Candidate + Resume + VacancyCandidate; добавлена persistence-реализация для нового сценария.
        services.AddScoped<ICreateCandidateResumePersistence, CreateCandidateResumePersistence>();
        services.AddScoped<ICreateVacancyPersistence, CreateVacancyPersistence>();
        services.AddScoped<IGetVacancyByIdPersistence, GetVacancyByIdPersistence>();
        services.AddScoped<IGetVacanciesPersistence, GetVacanciesPersistence>();
        services.AddScoped<IUpdateVacancyPersistence, UpdateVacancyPersistence>();
        // @dvnull: Добавлена persistence-реализация смены статуса вакансии.
        services.AddScoped<IUpdateVacancyStatusPersistence, UpdateVacancyStatusPersistence>();
        services.AddScoped<IDeleteVacancyPersistence, DeleteVacancyPersistence>();
        services.AddScoped<IProfileReadPersistence, ProfileReadPersistence>();
        services.AddScoped<IProfileWritePersistence, ProfileWritePersistence>();
        services.AddScoped<ISwitchMyActiveRolePersistence, ProfileWritePersistence>();
        services.AddDbContext<AppDbContext>((serviceProvider, options) =>
        {
            var configuration = serviceProvider.GetRequiredService<IConfiguration>();
            var connectionString = configuration.GetConnectionString("Postgres");
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.MigrationsAssembly("Infrastructure"));
        });
        services.AddHealthChecks()
            .AddCheck<PostgresDependencyHealthCheck>("postgres", tags: ["dependencies"])
            .AddCheck<RedisDependencyHealthCheck>("redis", tags: ["dependencies"])
            .AddCheck<RabbitMqDependencyHealthCheck>("rabbitmq", tags: ["dependencies"]);
        return services;
    }
}
