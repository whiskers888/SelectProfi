using SelectProfi.backend.Application.Vacancies.DeleteVacancy;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;
using Xunit;

namespace SelectProfi.backend.IntegrationTests;

public sealed class DeleteVacancyCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_DeletesVacancy_AndPersistsSinglePipelineRevisionIncrement()
    {
        var executorId = Guid.NewGuid();
        var vacancy = new Vacancy
        {
            Id = Guid.NewGuid(),
            ExecutorId = executorId,
            CandidatePipelineRevision = 7
        };
        var persistence = new FakeDeleteVacancyPersistence { StoredVacancy = vacancy };
        var handler = new DeleteVacancyCommandHandler(persistence);

        var result = await handler.HandleAsync(
            new DeleteVacancyCommand
            {
                VacancyId = vacancy.Id,
                RequesterUserId = executorId,
                RequesterRole = UserRole.Executor
            },
            CancellationToken.None);

        Assert.Equal(DeleteVacancyErrorCode.None, result.ErrorCode);
        Assert.Equal(8, vacancy.CandidatePipelineRevision);
        Assert.Equal(1, persistence.SaveCount);
        Assert.Equal(8, persistence.PersistedCandidatePipelineRevision);
        Assert.NotNull(vacancy.DeletedAtUtc);
    }

    private sealed class FakeDeleteVacancyPersistence : IDeleteVacancyPersistence
    {
        public Vacancy? StoredVacancy { get; init; }

        public int SaveCount { get; private set; }

        public int? PersistedCandidatePipelineRevision { get; private set; }

        public Task<Vacancy?> FindActiveByIdAsync(Guid vacancyId, CancellationToken cancellationToken)
        {
            return Task.FromResult(StoredVacancy);
        }

        public Task<DeleteVacancyPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
        {
            SaveCount++;
            PersistedCandidatePipelineRevision = StoredVacancy?.CandidatePipelineRevision;
            return Task.FromResult(DeleteVacancyPersistenceResult.Saved);
        }
    }
}
