using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SelectProfi.backend.Contracts.Vacancies;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;
using SelectProfi.backend.IntegrationTests.Infrastructure;
using Xunit;

namespace SelectProfi.backend.IntegrationTests;

public sealed class VacancyPipelineLifecycleHttpTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly IConfiguration _configuration;

    public VacancyPipelineLifecycleHttpTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _configuration = factory.Services.GetService(typeof(IConfiguration)) as IConfiguration
            ?? throw new InvalidOperationException("IConfiguration is not available.");
    }

    [Fact]
    public async Task CreateCandidateResume_WhenVacancyNotPublished_ReturnsConflictCode()
    {
        var scenario = await SeedVacancyScenarioAsync(VacancyStatus.Draft);
        using var client = CreateAuthorizedClient(scenario.Executor);

        using var response = await client.PostAsJsonAsync(
            $"/api/vacancies/{scenario.VacancyId}/candidates/resumes",
            new CreateCandidateResumeRequest
            {
                FullName = "Ivan Ivanov",
                BirthDate = new DateOnly(1995, 6, 1),
                Email = $"candidate-{Guid.NewGuid():N}@selectprofi.test",
                Phone = "+79990000001",
                Specialization = "backend developer",
                ResumeTitle = "Senior .NET Developer",
                ResumeContentJson = "{}"
            });

        await AssertVacancyNotPublishedAsync(response);
    }

    [Fact]
    public async Task AddCandidateFromBase_WhenVacancyNotPublished_ReturnsConflictCode()
    {
        var scenario = await SeedVacancyScenarioAsync(VacancyStatus.Draft);
        using var client = CreateAuthorizedClient(scenario.Executor);

        using var response = await client.PostAsync(
            $"/api/vacancies/{scenario.VacancyId}/candidates/{Guid.NewGuid()}",
            content: null);

        await AssertVacancyNotPublishedAsync(response);
    }

    [Fact]
    public async Task UpdateCandidateStage_WhenVacancyNotPublished_ReturnsConflictCode()
    {
        var scenario = await SeedVacancyScenarioAsync(VacancyStatus.Draft);
        using var client = CreateAuthorizedClient(scenario.Executor);

        using var response = await client.PatchAsJsonAsync(
            $"/api/vacancies/{scenario.VacancyId}/candidates/{Guid.NewGuid()}/stage",
            new UpdateVacancyCandidateStageRequest
            {
                Stage = VacancyCandidateStageContract.Shortlist
            });

        await AssertVacancyNotPublishedAsync(response);
    }

    [Fact]
    public async Task SelectCandidate_WhenVacancyNotPublished_ReturnsConflictCode()
    {
        var scenario = await SeedVacancyScenarioAsync(VacancyStatus.Draft);
        using var client = CreateAuthorizedClient(scenario.Customer);

        using var response = await client.PatchAsJsonAsync(
            $"/api/vacancies/{scenario.VacancyId}/selected-candidate",
            new SelectVacancyCandidateRequest
            {
                CandidateId = Guid.NewGuid()
            });

        await AssertVacancyNotPublishedAsync(response);
    }

    [Fact]
    public async Task CreateCandidateResume_WhenVacancyPublished_ReturnsCreated()
    {
        var scenario = await SeedVacancyScenarioAsync(VacancyStatus.Published);
        using var client = CreateAuthorizedClient(scenario.Executor);
        var candidateKey = Guid.NewGuid().ToString("N");

        using var response = await client.PostAsJsonAsync(
            $"/api/vacancies/{scenario.VacancyId}/candidates/resumes",
            new CreateCandidateResumeRequest
            {
                FullName = $"Ivan Ivanov {candidateKey[..6]}",
                BirthDate = new DateOnly(1995, 6, 1),
                Email = $"candidate-{candidateKey}@selectprofi.test",
                Phone = BuildUniquePhone(candidateKey),
                Specialization = "backend developer",
                ResumeTitle = "Senior .NET Developer",
                ResumeContentJson = "{}"
            });
        var payload = await response.Content.ReadFromJsonAsync<CandidateResumeResponse>();

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(payload);
        Assert.NotEqual(Guid.Empty, payload!.CandidateId);
        Assert.NotEqual(Guid.Empty, payload.CandidateResumeId);
        Assert.NotEqual(Guid.Empty, payload.VacancyCandidateId);
        Assert.False(string.IsNullOrWhiteSpace(payload.PublicAlias));
    }

    [Fact]
    public async Task AddCandidateFromBase_WhenVacancyPublished_ReturnsCreated()
    {
        var scenario = await SeedVacancyScenarioAsync(VacancyStatus.Published);
        var candidateId = await SeedRegisteredCandidateAsync();
        using var client = CreateAuthorizedClient(scenario.Executor);

        using var response = await client.PostAsync(
            $"/api/vacancies/{scenario.VacancyId}/candidates/{candidateId}",
            content: null);
        var payload = await response.Content.ReadFromJsonAsync<VacancyCandidateResponse>();

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(payload);
        Assert.Equal(scenario.VacancyId, payload!.VacancyId);
        Assert.Equal(candidateId, payload.CandidateId);
        Assert.Equal("Pool", payload.Stage);
    }

    [Fact]
    public async Task UpdateCandidateStage_WhenVacancyPublished_ReturnsOk()
    {
        var scenario = await SeedVacancyScenarioAsync(VacancyStatus.Published);
        var candidateId = await SeedVacancyCandidateLinkAsync(
            scenario,
            CandidateSource.AddedByExecutor,
            VacancyCandidateStage.Pool);
        using var client = CreateAuthorizedClient(scenario.Executor);

        using var response = await client.PatchAsJsonAsync(
            $"/api/vacancies/{scenario.VacancyId}/candidates/{candidateId}/stage",
            new UpdateVacancyCandidateStageRequest
            {
                Stage = VacancyCandidateStageContract.Shortlist
            });
        var payload = await response.Content.ReadFromJsonAsync<VacancyCandidateResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(payload);
        Assert.Equal(candidateId, payload!.CandidateId);
        Assert.Equal("Shortlist", payload.Stage);
    }

    [Fact]
    public async Task SelectCandidate_WhenVacancyPublishedAndCandidateInShortlist_ReturnsOk()
    {
        var scenario = await SeedVacancyScenarioAsync(VacancyStatus.Published);
        var candidateId = await SeedVacancyCandidateLinkAsync(
            scenario,
            CandidateSource.AddedByExecutor,
            VacancyCandidateStage.Shortlist);
        using var client = CreateAuthorizedClient(scenario.Customer);

        using var response = await client.PatchAsJsonAsync(
            $"/api/vacancies/{scenario.VacancyId}/selected-candidate",
            new SelectVacancyCandidateRequest
            {
                CandidateId = candidateId
            });
        var payload = await response.Content.ReadFromJsonAsync<SelectedVacancyCandidateResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(payload);
        Assert.Equal(scenario.VacancyId, payload!.VacancyId);
        Assert.Equal(candidateId, payload.SelectedCandidateId);
    }

    private async Task<TestScenario> SeedVacancyScenarioAsync(VacancyStatus status)
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var now = DateTime.UtcNow;

        var customer = BuildUser(UserRole.Customer);
        var executor = BuildUser(UserRole.Executor);
        var orderId = Guid.NewGuid();
        var vacancyId = Guid.NewGuid();

        dbContext.Users.AddRange(customer.DbUser, executor.DbUser);
        dbContext.Orders.Add(new Order
        {
            Id = orderId,
            CustomerId = customer.Id,
            ExecutorId = executor.Id,
            Title = "Order for integration tests",
            Description = "Integration test order description",
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        });
        dbContext.Vacancies.Add(new Vacancy
        {
            Id = vacancyId,
            OrderId = orderId,
            CustomerId = customer.Id,
            ExecutorId = executor.Id,
            Title = "Vacancy for integration tests",
            Description = "Integration test vacancy description",
            Status = status,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        });

        await dbContext.SaveChangesAsync();

        return new TestScenario(vacancyId, customer, executor);
    }

    private async Task<Guid> SeedRegisteredCandidateAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var now = DateTime.UtcNow;
        var userId = Guid.NewGuid();
        var userEmail = $"applicant-{userId:N}@selectprofi.test";
        var candidateId = Guid.NewGuid();

        dbContext.Users.Add(new User
        {
            Id = userId,
            Email = userEmail,
            NormalizedEmail = userEmail.ToUpperInvariant(),
            PasswordHash = "integration-test-hash",
            FirstName = "Applicant",
            LastName = "Integration",
            Role = UserRole.Applicant,
            IsEmailVerified = true,
            IsPhoneVerified = true,
            CreatedAtUtc = now
        });
        dbContext.Candidates.Add(new Candidate
        {
            Id = candidateId,
            UserId = userId,
            CreatedByExecutorId = null,
            FullName = "Registered Candidate",
            NormalizedFullName = "REGISTERED CANDIDATE",
            BirthDate = new DateOnly(1994, 4, 4),
            PublicAlias = "Неопознанный аналитик",
            Email = userEmail,
            NormalizedEmail = userEmail.ToUpperInvariant(),
            Phone = null,
            NormalizedPhone = null,
            ContactsOwnerExecutorId = null,
            ContactsAccessExpiresAtUtc = null,
            Source = CandidateSource.RegisteredUser,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        });

        await dbContext.SaveChangesAsync();

        return candidateId;
    }

    private async Task<Guid> SeedVacancyCandidateLinkAsync(
        TestScenario scenario,
        CandidateSource source,
        VacancyCandidateStage stage)
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var now = DateTime.UtcNow;
        var candidateId = Guid.NewGuid();
        var candidateKey = candidateId.ToString("N");

        dbContext.Candidates.Add(new Candidate
        {
            Id = candidateId,
            UserId = null,
            CreatedByExecutorId = scenario.Executor.Id,
            FullName = $"Pipeline Candidate {candidateKey[..6]}",
            NormalizedFullName = $"PIPELINE CANDIDATE {candidateKey[..6]}",
            BirthDate = new DateOnly(1993, 3, 3),
            PublicAlias = "Системный разработчик",
            Email = $"pipeline-{candidateKey}@selectprofi.test",
            NormalizedEmail = $"PIPELINE-{candidateKey}@SELECTPROFI.TEST",
            Phone = BuildUniquePhone(candidateKey),
            NormalizedPhone = NormalizePhone(BuildUniquePhone(candidateKey)),
            ContactsOwnerExecutorId = scenario.Executor.Id,
            ContactsAccessExpiresAtUtc = now.AddDays(180),
            Source = source,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        });
        dbContext.VacancyCandidates.Add(new VacancyCandidate
        {
            Id = Guid.NewGuid(),
            VacancyId = scenario.VacancyId,
            CandidateId = candidateId,
            AddedByExecutorId = scenario.Executor.Id,
            Stage = stage,
            AddedAtUtc = now,
            UpdatedAtUtc = now
        });

        await dbContext.SaveChangesAsync();

        return candidateId;
    }

    private HttpClient CreateAuthorizedClient(TestUser user)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", CreateAccessToken(_configuration, user));
        return client;
    }

    private static async Task AssertVacancyNotPublishedAsync(HttpResponseMessage response)
    {
        using var payload = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("vacancy_not_published", payload.RootElement.GetProperty("code").GetString());
    }

    private static TestUser BuildUser(UserRole role)
    {
        var userId = Guid.NewGuid();
        var email = $"{role.ToString().ToLowerInvariant()}-{userId:N}@selectprofi.test";
        return new TestUser(
            userId,
            email,
            role,
            new User
            {
                Id = userId,
                Email = email,
                NormalizedEmail = email.ToUpperInvariant(),
                PasswordHash = "integration-test-hash",
                FirstName = role.ToString(),
                LastName = "Integration",
                Role = role,
                IsEmailVerified = true,
                IsPhoneVerified = true,
                CreatedAtUtc = DateTime.UtcNow
            });
    }

    private static string CreateAccessToken(IConfiguration configuration, TestUser user)
    {
        var issuer = configuration["Jwt:Issuer"] ?? string.Empty;
        var audience = configuration["Jwt:Audience"] ?? string.Empty;
        var signingKey = configuration["Jwt:SigningKey"] ?? string.Empty;

        if (string.IsNullOrWhiteSpace(issuer) ||
            string.IsNullOrWhiteSpace(audience) ||
            string.IsNullOrWhiteSpace(signingKey))
            throw new InvalidOperationException("JWT test configuration is not complete.");

        var utcNow = DateTime.UtcNow;
        var headerJson = JsonSerializer.Serialize(new { alg = "HS256", typ = "JWT" });
        var payloadJson = JsonSerializer.Serialize(new
        {
            sub = user.Id.ToString(),
            email = user.Email,
            role = user.Role.ToString(),
            iss = issuer,
            aud = audience,
            iat = ToUnixSeconds(utcNow),
            nbf = ToUnixSeconds(utcNow),
            exp = ToUnixSeconds(utcNow.AddMinutes(15)),
            jti = Guid.NewGuid().ToString("N")
        });

        var header = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));
        var payload = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));
        var signature = ComputeSignature($"{header}.{payload}", signingKey);

        return $"{header}.{payload}.{signature}";
    }

    private static string ComputeSignature(string data, string signingKey)
    {
        var keyBytes = Encoding.UTF8.GetBytes(signingKey);
        var dataBytes = Encoding.UTF8.GetBytes(data);

        using var hmac = new HMACSHA256(keyBytes);
        var signature = hmac.ComputeHash(dataBytes);

        return Base64UrlEncode(signature);
    }

    private static string Base64UrlEncode(byte[] input)
    {
        return Convert.ToBase64String(input)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private static long ToUnixSeconds(DateTime utcDateTime)
    {
        return new DateTimeOffset(utcDateTime).ToUnixTimeSeconds();
    }

    private static string BuildUniquePhone(string key)
    {
        var digits = new string(key.Where(char.IsDigit).ToArray());
        var normalized = (digits + "0000000000")[..10];
        return $"+7{normalized}";
    }

    private static string NormalizePhone(string phone)
    {
        var digits = phone.Where(char.IsDigit).ToArray();
        return new string(digits);
    }

    private sealed record TestScenario(Guid VacancyId, TestUser Customer, TestUser Executor);

    private sealed record TestUser(Guid Id, string Email, UserRole Role, User DbUser);
}
