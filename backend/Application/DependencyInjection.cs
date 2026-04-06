using Microsoft.Extensions.DependencyInjection;
using SelectProfi.backend.Application.Candidates.AddCandidateFromBase;
using SelectProfi.backend.Application.Candidates.GetVacancyCandidateContactsForExecutor;
using SelectProfi.backend.Application.Candidates.GetSelectedCandidateContacts;
using SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;
using SelectProfi.backend.Application.Candidates.UpdateVacancyCandidateStage;
using SelectProfi.backend.Application.Auth.Login;
using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Application.Cqrs;
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
        // @dvnull: Добавлен отдельный command для привязки существующего кандидата из базы к вакансии без создания нового резюме.
        services.AddScoped<ICommandHandler<AddCandidateFromBaseCommand, AddCandidateFromBaseResult>, AddCandidateFromBaseCommandHandler>();
        // @dvnull: Добавлен command смены стадии кандидата в vacancy pipeline с инвариантом selectedCandidate.
        services.AddScoped<ICommandHandler<UpdateVacancyCandidateStageCommand, UpdateVacancyCandidateStageResult>, UpdateVacancyCandidateStageCommandHandler>();
        // @dvnull: Добавлен command финального выбора кандидата заказчиком только из shortlist.
        services.AddScoped<ICommandHandler<SelectVacancyCandidateCommand, SelectVacancyCandidateResult>, SelectVacancyCandidateCommandHandler>();
        // @dvnull: Ранее application-слой не содержал command для ручного заведения кандидата и резюме; добавлено для первого этапа Candidate/Resume flow.
        services.AddScoped<ICommandHandler<CreateCandidateResumeCommand, CreateCandidateResumeResult>, CreateCandidateResumeCommandHandler>();
        services.AddScoped<ICommandHandler<CreateVacancyCommand, CreateVacancyResult>, CreateVacancyCommandHandler>();
        services.AddScoped<ICommandHandler<UpdateVacancyCommand, UpdateVacancyResult>, UpdateVacancyCommandHandler>();
        // @dvnull: Добавлен command смены статуса вакансии в процессе согласования и публикации.
        services.AddScoped<ICommandHandler<UpdateVacancyStatusCommand, UpdateVacancyStatusResult>, UpdateVacancyStatusCommandHandler>();
        services.AddScoped<ICommandHandler<DeleteVacancyCommand, DeleteVacancyResult>, DeleteVacancyCommandHandler>();
        services.AddScoped<IQueryHandler<GetOrderByIdQuery, GetOrderByIdResult>, GetOrderByIdQueryHandler>();
        services.AddScoped<IQueryHandler<GetOrdersQuery, GetOrdersResult>, GetOrdersQueryHandler>();
        services.AddScoped<IQueryHandler<GetVacancyByIdQuery, GetVacancyByIdResult>, GetVacancyByIdQueryHandler>();
        services.AddScoped<IQueryHandler<GetVacanciesQuery, GetVacanciesResult>, GetVacanciesQueryHandler>();
        // @dvnull: Добавлен query получения контактов кандидата для назначенного рекрутера с проверкой owner+TTL.
        services.AddScoped<IQueryHandler<GetVacancyCandidateContactsForExecutorQuery, GetVacancyCandidateContactsForExecutorResult>, GetVacancyCandidateContactsForExecutorQueryHandler>();
        // @dvnull: Добавлен query получения контактов выбранного кандидата для заказчика после финального выбора.
        services.AddScoped<IQueryHandler<GetSelectedCandidateContactsQuery, GetSelectedCandidateContactsResult>, GetSelectedCandidateContactsQueryHandler>();
        services.AddScoped<IQueryHandler<GetMyProfileQuery, GetMyProfileResult>, GetMyProfileQueryHandler>();
        services.AddScoped<ICommandHandler<SwitchMyActiveRoleCommand, SwitchMyActiveRoleResult>, SwitchMyActiveRoleCommandHandler>();
        services.AddScoped<ICommandHandler<UpdateMyProfileCommand, UpdateMyProfileResult>, UpdateMyProfileCommandHandler>();
        return services;
    }
}
