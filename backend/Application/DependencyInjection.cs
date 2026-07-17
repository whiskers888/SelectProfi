using Microsoft.Extensions.DependencyInjection;
using SelectProfi.backend.Application.Candidates.AddCandidateFromBase;
using SelectProfi.backend.Application.Candidates.RemoveVacancyCandidate;
using SelectProfi.backend.Application.Candidates.GetVacancyCandidateContactsForExecutor;
using SelectProfi.backend.Application.Candidates.GetVacancyBaseCandidates;
using SelectProfi.backend.Application.Candidates.GetMyCandidates;
using SelectProfi.backend.Application.Candidates.GetVacancyCandidates;
using SelectProfi.backend.Application.Candidates.GetSelectedCandidateContacts;
using SelectProfi.backend.Application.Candidates.MarkVacancyCandidateViewedByCustomer;
using SelectProfi.backend.Application.Candidates.RespondToVacancy;
using SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;
using SelectProfi.backend.Application.Candidates.UpdateVacancyCandidateStage;
using SelectProfi.backend.Application.Candidates.UploadCandidateResumeAttachment;
using SelectProfi.backend.Application.Auth.Login;
using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Candidates.CreateCandidateResume;
using SelectProfi.backend.Application.Dashboard.GetCustomerDashboardStats;
using SelectProfi.backend.Application.Dashboard.GetExecutorDashboardStats;
using SelectProfi.backend.Application.Orders.CreateOrder;
using SelectProfi.backend.Application.Orders.DeleteOrder;
using SelectProfi.backend.Application.Orders.GetOrderById;
using SelectProfi.backend.Application.Orders.GetOrderExecutors;
using SelectProfi.backend.Application.Orders.GetOrderSpecializations;
using SelectProfi.backend.Application.Orders.GetMyOrderResponse;
using SelectProfi.backend.Application.Orders.GetMyOrders;
using SelectProfi.backend.Application.Orders.GetOrders;
using SelectProfi.backend.Application.Orders.GetOrderResponses;
using SelectProfi.backend.Application.Orders.RejectOrderResponse;
using SelectProfi.backend.Application.Orders.RespondToOrder;
using SelectProfi.backend.Application.Orders.SelectOrderResponseExecutor;
using SelectProfi.backend.Application.Orders.CreateOrderSpecialization;
using SelectProfi.backend.Application.Orders.UpdateOrder;
using SelectProfi.backend.Application.Orders.UpdateOrderSpecialization;
using SelectProfi.backend.Application.Orders.WithdrawOrderResponse;
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

public static class 
    DependencyInjection
{
    public static IServiceCollection AddApplicationLayer(this IServiceCollection services)
    {
        services.AddScoped<ICommandDispatcher>(serviceProvider => new CommandDispatcher(serviceProvider.GetService));
        services.AddScoped<IQueryDispatcher>(serviceProvider => new QueryDispatcher(serviceProvider.GetService));
        services.AddScoped<ICommandHandler<RegisterUserCommand, RegisterUserResult>, RegisterUserCommandHandler>();
        services.AddScoped<ICommandHandler<LoginUserCommand, LoginUserResult>, LoginUserCommandHandler>();
        services.AddScoped<ICommandHandler<RefreshAuthSessionCommand, RefreshAuthSessionResult>, RefreshAuthSessionCommandHandler>();
        services.AddScoped<ICommandHandler<CreateOrderCommand, CreateOrderResult>, CreateOrderCommandHandler>();
        // @dvnull: Ранее справочник специализаций создавался напрямую в контроллере; добавлен CQRS-command для create specialization.
        services.AddScoped<ICommandHandler<CreateOrderSpecializationCommand, CreateOrderSpecializationResult>, CreateOrderSpecializationCommandHandler>();
        services.AddScoped<ICommandHandler<RejectOrderResponseCommand, RejectOrderResponseResult>, RejectOrderResponseCommandHandler>();
        services.AddScoped<ICommandHandler<RespondToOrderCommand, RespondToOrderResult>, RespondToOrderCommandHandler>();
        services.AddScoped<ICommandHandler<WithdrawOrderResponseCommand, WithdrawOrderResponseResult>, WithdrawOrderResponseCommandHandler>();
        services.AddScoped<ICommandHandler<SelectOrderResponseExecutorCommand, SelectOrderResponseExecutorResult>, SelectOrderResponseExecutorCommandHandler>();
        services.AddScoped<ICommandHandler<UpdateOrderCommand, UpdateOrderResult>, UpdateOrderCommandHandler>();
        // @dvnull: Ранее обновление specialization выполнялось напрямую через DbContext в API; добавлен CQRS-command для update specialization.
        services.AddScoped<ICommandHandler<UpdateOrderSpecializationCommand, UpdateOrderSpecializationResult>, UpdateOrderSpecializationCommandHandler>();
        services.AddScoped<ICommandHandler<DeleteOrderCommand, DeleteOrderResult>, DeleteOrderCommandHandler>();
        // @dvnull: Добавлен command отклика соискателя на опубликованную вакансию с автопривязкой registered candidate в pipeline.
        services.AddScoped<ICommandHandler<RespondToVacancyCommand, RespondToVacancyResult>, RespondToVacancyCommandHandler>();
        // @dvnull: Добавлен отдельный command для привязки существующего кандидата из базы к вакансии без создания нового резюме.
        services.AddScoped<ICommandHandler<AddCandidateFromBaseCommand, AddCandidateFromBaseResult>, AddCandidateFromBaseCommandHandler>();
        services.AddScoped<ICommandHandler<RemoveVacancyCandidateCommand, RemoveVacancyCandidateResult>, RemoveVacancyCandidateCommandHandler>();
        // @dvnull: Добавлен command смены стадии кандидата в vacancy pipeline с инвариантом selectedCandidate.
        services.AddScoped<ICommandHandler<UpdateVacancyCandidateStageCommand, UpdateVacancyCandidateStageResult>, UpdateVacancyCandidateStageCommandHandler>();
        services.AddScoped<ICommandHandler<UploadCandidateResumeAttachmentCommand, UploadCandidateResumeAttachmentResult>, UploadCandidateResumeAttachmentCommandHandler>();
        // @dvnull: Добавлен command финального выбора кандидата заказчиком только из shortlist.
        services.AddScoped<ICommandHandler<SelectVacancyCandidateCommand, SelectVacancyCandidateResult>, SelectVacancyCandidateCommandHandler>();
        // @dvnull: Добавлен command фиксации просмотра кандидата заказчиком для расчета счетчика новых профилей.
        services.AddScoped<ICommandHandler<MarkVacancyCandidateViewedByCustomerCommand, MarkVacancyCandidateViewedByCustomerResult>, MarkVacancyCandidateViewedByCustomerCommandHandler>();
        // @dvnull: Ранее application-слой не содержал command для ручного заведения кандидата и резюме; добавлено для первого этапа Candidate/Resume flow.
        services.AddScoped<ICommandHandler<CreateCandidateResumeCommand, CreateCandidateResumeResult>, CreateCandidateResumeCommandHandler>();
        services.AddScoped<ICommandHandler<CreateVacancyCommand, CreateVacancyResult>, CreateVacancyCommandHandler>();
        services.AddScoped<ICommandHandler<UpdateVacancyCommand, UpdateVacancyResult>, UpdateVacancyCommandHandler>();
        // @dvnull: Добавлен command смены статуса вакансии в процессе согласования и публикации.
        services.AddScoped<ICommandHandler<UpdateVacancyStatusCommand, UpdateVacancyStatusResult>, UpdateVacancyStatusCommandHandler>();
        services.AddScoped<ICommandHandler<DeleteVacancyCommand, DeleteVacancyResult>, DeleteVacancyCommandHandler>();
        services.AddScoped<IQueryHandler<GetOrderByIdQuery, GetOrderByIdResult>, GetOrderByIdQueryHandler>();
        services.AddScoped<IQueryHandler<GetOrderExecutorsQuery, GetOrderExecutorsResult>, GetOrderExecutorsQueryHandler>();
        // @dvnull: Ранее список specialization запрашивался напрямую из контроллера; добавлен CQRS-query для dictionary списка.
        services.AddScoped<IQueryHandler<GetOrderSpecializationsQuery, GetOrderSpecializationsResult>, GetOrderSpecializationsQueryHandler>();
        services.AddScoped<IQueryHandler<GetMyOrderResponseQuery, GetMyOrderResponseResult>, GetMyOrderResponseQueryHandler>();
        services.AddScoped<IQueryHandler<GetOrdersQuery, GetOrdersResult>, GetOrdersQueryHandler>();
        services.AddScoped<IQueryHandler<GetMyOrdersQuery, GetOrdersResult>, GetMyOrdersQueryHandler>();
        services.AddScoped<IQueryHandler<GetOrderResponsesQuery, GetOrderResponsesResult>, GetOrderResponsesQueryHandler>();
        // @dvnull: Добавлен query-handler серверной агрегации dashboard-метрик заказчика для отдельного frontend-запроса статистики.
        services.AddScoped<IQueryHandler<GetCustomerDashboardStatsQuery, GetCustomerDashboardStatsResult>, GetCustomerDashboardStatsQueryHandler>();
        // @dvnull: Добавлен query-handler серверной агрегации dashboard-метрик исполнителя для отдельного frontend-запроса статистики.
        services.AddScoped<IQueryHandler<GetExecutorDashboardStatsQuery, GetExecutorDashboardStatsResult>, GetExecutorDashboardStatsQueryHandler>();
        services.AddScoped<IQueryHandler<GetVacancyByIdQuery, GetVacancyByIdResult>, GetVacancyByIdQueryHandler>();
        services.AddScoped<IQueryHandler<GetVacanciesQuery, GetVacanciesResult>, GetVacanciesQueryHandler>();
        // @dvnull: Добавлен query получения контактов кандидата для назначенного рекрутера с проверкой owner+TTL.
        services.AddScoped<IQueryHandler<GetVacancyCandidateContactsForExecutorQuery, GetVacancyCandidateContactsForExecutorResult>, GetVacancyCandidateContactsForExecutorQueryHandler>();
        // @dvnull: Добавлен query получения обезличенного списка кандидатов вакансии для выборки на frontend без контактов.
        services.AddScoped<IQueryHandler<GetVacancyCandidatesQuery, GetVacancyCandidatesResult>, GetVacancyCandidatesQueryHandler>();
        services.AddScoped<IQueryHandler<GetVacancyBaseCandidatesQuery, GetVacancyBaseCandidatesResult>, GetVacancyBaseCandidatesQueryHandler>();
        services.AddScoped<IQueryHandler<GetMyCandidatesQuery, GetMyCandidatesResult>, GetMyCandidatesQueryHandler>();
        // @dvnull: Добавлен query получения контактов выбранного кандидата для заказчика после финального выбора.
        services.AddScoped<IQueryHandler<GetSelectedCandidateContactsQuery, GetSelectedCandidateContactsResult>, GetSelectedCandidateContactsQueryHandler>();
        services.AddScoped<IQueryHandler<GetMyProfileQuery, GetMyProfileResult>, GetMyProfileQueryHandler>();
        services.AddScoped<ICommandHandler<SwitchMyActiveRoleCommand, SwitchMyActiveRoleResult>, SwitchMyActiveRoleCommandHandler>();
        services.AddScoped<ICommandHandler<UpdateMyProfileCommand, UpdateMyProfileResult>, UpdateMyProfileCommandHandler>();
        return services;
    }
}
