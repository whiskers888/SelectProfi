using SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;
using SelectProfi.backend.Application.Orders.ProjectWorkspace;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;
using Xunit;

namespace SelectProfi.backend.IntegrationTests;

public sealed class ProjectWorkspaceCommandHandlerTests
{
    [Fact]
    public async Task SelectingSubmittedCandidateCompletesProject()
    {
        var now = DateTime.UtcNow;
        var customerId = Guid.NewGuid();
        var order = new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId,
            ExecutorId = Guid.NewGuid(),
            Status = OrderStatus.Active,
            CreatedAtUtc = now.AddDays(-1),
            UpdatedAtUtc = now.AddDays(-1)
        };
        var vacancy = new Vacancy
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            Order = order,
            CustomerId = customerId,
            ExecutorId = order.ExecutorId!.Value,
            Status = VacancyStatus.Published,
            CreatedAtUtc = now.AddDays(-1),
            UpdatedAtUtc = now.AddDays(-1)
        };
        var persistence = new FakeSelectVacancyCandidatePersistence(vacancy);
        var handler = new SelectVacancyCandidateCommandHandler(persistence);
        var command = new SelectVacancyCandidateCommand
        {
            VacancyId = vacancy.Id,
            CandidateId = Guid.NewGuid(),
            RequesterUserId = customerId,
            RequesterRole = UserRole.Customer
        };

        var result = await handler.HandleAsync(command, CancellationToken.None);

        Assert.Equal(SelectVacancyCandidateErrorCode.None, result.ErrorCode);
        Assert.Equal(OrderStatus.Completed, order.Status);
        Assert.NotNull(order.CompletedAtUtc);
        Assert.Equal(command.CandidateId, vacancy.SelectedCandidateId);
        Assert.Equal(1, persistence.SaveCount);
    }

    [Fact]
    public async Task SetDueDateRecordsActivityForAssignedExecutor()
    {
        var executorId = Guid.NewGuid();
        var order = NewOrder(executorId);
        var persistence = new FakeProjectWorkspacePersistence(order);
        var storage = new FakeProjectDocumentStorage();
        var handler = new ProjectWorkspaceCommandHandler(persistence, storage);
        var dueDate = new DateOnly(2026, 12, 1);

        var result = await handler.HandleAsync(
            new SetProjectDueDateCommand(order.Id, executorId, dueDate),
            CancellationToken.None);

        Assert.Equal(ProjectWorkspaceErrorCode.None, result.ErrorCode);
        Assert.Equal(dueDate, order.DueDate);
        Assert.Equal("DueDateChanged", Assert.Single(persistence.Activities).Action);
        Assert.Equal(1, persistence.SaveCount);
    }

    [Fact]
    public async Task SetDueDateRejectsDifferentExecutor()
    {
        var order = NewOrder(Guid.NewGuid());
        var persistence = new FakeProjectWorkspacePersistence(order);
        var handler = new ProjectWorkspaceCommandHandler(persistence, new FakeProjectDocumentStorage());

        var result = await handler.HandleAsync(
            new SetProjectDueDateCommand(order.Id, Guid.NewGuid(), new DateOnly(2026, 12, 1)),
            CancellationToken.None);

        Assert.Equal(ProjectWorkspaceErrorCode.Forbidden, result.ErrorCode);
        Assert.Equal(0, persistence.SaveCount);
    }

    [Fact]
    public async Task UploadRejectsUnsupportedFileWithoutCallingStorage()
    {
        var executorId = Guid.NewGuid();
        var order = NewOrder(executorId);
        var persistence = new FakeProjectWorkspacePersistence(order);
        var storage = new FakeProjectDocumentStorage();
        var handler = new ProjectWorkspaceCommandHandler(persistence, storage);

        var result = await handler.HandleAsync(
            new UploadProjectDocumentCommand(order.Id, executorId, "payload.exe", 12, new MemoryStream([1, 2, 3])),
            CancellationToken.None);

        Assert.Equal(ProjectWorkspaceErrorCode.InvalidFile, result.ErrorCode);
        Assert.Equal(0, storage.SaveCount);
        Assert.Equal(0, persistence.SaveCount);
    }

    private static Order NewOrder(Guid executorId) => new()
    {
        Id = Guid.NewGuid(),
        CustomerId = Guid.NewGuid(),
        ExecutorId = executorId,
        Status = OrderStatus.Active,
        CreatedAtUtc = DateTime.UtcNow,
        UpdatedAtUtc = DateTime.UtcNow
    };

    private sealed class FakeSelectVacancyCandidatePersistence(Vacancy vacancy) : ISelectVacancyCandidatePersistence
    {
        public int SaveCount { get; private set; }

        public Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken) =>
            Task.FromResult<Vacancy?>(vacancyId == vacancy.Id ? vacancy : null);

        public Task<bool> CandidateInSubmittedShortlistAsync(Guid vacancyId, Guid candidateId, CancellationToken cancellationToken) =>
            Task.FromResult(vacancyId == vacancy.Id);

        public Task<SelectVacancyCandidatePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
        {
            SaveCount++;
            return Task.FromResult(SelectVacancyCandidatePersistenceResult.Saved);
        }
    }

    private sealed class FakeProjectWorkspacePersistence(Order order) : IProjectWorkspacePersistence
    {
        public List<ProjectActivity> Activities { get; } = [];
        public List<ProjectDocument> Documents { get; } = [];
        public int SaveCount { get; private set; }

        public Task<Order?> FindActiveOrderByIdAsync(Guid orderId, CancellationToken cancellationToken) =>
            Task.FromResult<Order?>(orderId == order.Id ? order : null);

        public Task<IReadOnlyList<ProjectActivity>> FindHistoryAsync(Guid orderId, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<ProjectActivity>>(Activities);

        public Task<IReadOnlyList<ProjectDocument>> FindDocumentsAsync(Guid orderId, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<ProjectDocument>>(Documents);

        public Task<ProjectDocument?> FindDocumentAsync(Guid orderId, Guid documentId, CancellationToken cancellationToken) =>
            Task.FromResult(Documents.SingleOrDefault(document => document.OrderId == orderId && document.Id == documentId));

        public void AddActivity(ProjectActivity activity) => Activities.Add(activity);

        public void AddDocument(ProjectDocument document) => Documents.Add(document);

        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            SaveCount++;
            return Task.CompletedTask;
        }
    }

    private sealed class FakeProjectDocumentStorage : IProjectDocumentStorage
    {
        public int SaveCount { get; private set; }

        public Task<string> SaveAsync(Guid orderId, Stream content, string extension, string contentType, CancellationToken cancellationToken)
        {
            SaveCount++;
            return Task.FromResult($"projects/{orderId:N}/file{extension}");
        }

        public Task<byte[]> ReadAsync(string storageKey, CancellationToken cancellationToken) =>
            Task.FromResult(Array.Empty<byte>());

        public Task DeleteAsync(string storageKey, CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
