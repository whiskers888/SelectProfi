using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using SelectProfi.backend.Contracts.Auth;
using SelectProfi.backend.Contracts.Profile;
using SelectProfi.backend.IntegrationTests.Infrastructure;
using Xunit;

namespace SelectProfi.backend.IntegrationTests;

public sealed class AuthFlowHttpTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public AuthFlowHttpTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Register_Login_Refresh_Flow_WorksEndToEnd()
    {
        using var client = _factory.CreateClient();
        var password = "ValidPassword!123";
        var email = BuildUniqueEmail();

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = password,
                FirstName = "John",
                LastName = "Doe",
                Role = RegisterUserRole.Customer
            });
        var registerPayload = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();

        using var loginResponse = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginUserRequest
            {
                Email = email,
                Password = password
            });
        var loginPayload = await loginResponse.Content.ReadFromJsonAsync<LoginUserResponse>();

        using var refreshResponse = await client.PostAsJsonAsync(
            "/api/auth/refresh",
            new RefreshTokenRequest
            {
                RefreshToken = loginPayload?.RefreshToken ?? string.Empty
            });
        var refreshPayload = await refreshResponse.Content.ReadFromJsonAsync<RefreshTokenResponse>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", refreshPayload?.AccessToken);
        using var meResponse = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.NotNull(registerPayload);
        Assert.False(string.IsNullOrWhiteSpace(registerPayload!.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(registerPayload.RefreshToken));

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        Assert.NotNull(loginPayload);
        Assert.False(string.IsNullOrWhiteSpace(loginPayload!.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(loginPayload.RefreshToken));

        Assert.Equal(HttpStatusCode.OK, refreshResponse.StatusCode);
        Assert.NotNull(refreshPayload);
        Assert.False(string.IsNullOrWhiteSpace(refreshPayload!.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(refreshPayload.RefreshToken));
        Assert.NotEqual(loginPayload.RefreshToken, refreshPayload.RefreshToken);

        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
        using var meDocument = JsonDocument.Parse(await meResponse.Content.ReadAsStringAsync());
        Assert.Equal("Customer", meDocument.RootElement.GetProperty("role").GetString());
        Assert.Equal(email, meDocument.RootElement.GetProperty("email").GetString());
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsConflict()
    {
        using var client = _factory.CreateClient();
        var email = BuildUniqueEmail();

        using var firstResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = "ValidPassword!123",
                FirstName = "Jane",
                LastName = "Doe",
                Role = RegisterUserRole.Executor
            });

        using var secondResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = "ValidPassword!123",
                FirstName = "Jane",
                LastName = "Doe",
                Role = RegisterUserRole.Executor
            });
        using var secondPayload = JsonDocument.Parse(await secondResponse.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, secondResponse.StatusCode);
        Assert.Equal("email_already_exists", secondPayload.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Register_WithCustomerCombinedWithApplicant_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();

        using var response = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = BuildUniqueEmail(),
                Password = "ValidPassword!123",
                FirstName = "Combo",
                LastName = "User",
                Roles = [RegisterUserRole.Customer, RegisterUserRole.Applicant],
                CustomerRegistration = new CustomerRegistrationRequest
                {
                    Inn = "1234567890",
                    LegalForm = SelectProfi.backend.Contracts.Auth.CustomerLegalForm.Ooo,
                    Egrn = "1234567890123"
                },
                OfferAcceptance = new OfferAcceptanceRequest
                {
                    Accepted = true,
                    Version = "public-offer-v1"
                }
            });

        using var payload = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("validation_error", payload.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();
        var email = BuildUniqueEmail();

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = "ValidPassword!123",
                FirstName = "Mike",
                LastName = "Smith",
                Role = RegisterUserRole.Applicant
            });

        using var loginResponse = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginUserRequest
            {
                Email = email,
                Password = "WrongPassword!123"
            });
        using var loginPayload = JsonDocument.Parse(await loginResponse.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, loginResponse.StatusCode);
        Assert.Equal("invalid_credentials", loginPayload.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Refresh_WithReusedToken_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();
        var email = BuildUniqueEmail();

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = "ValidPassword!123",
                FirstName = "Anne",
                LastName = "Brown",
                Role = RegisterUserRole.Customer
            });
        var registerPayload = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();

        using var firstRefreshResponse = await client.PostAsJsonAsync(
            "/api/auth/refresh",
            new RefreshTokenRequest
            {
                RefreshToken = registerPayload?.RefreshToken ?? string.Empty
            });

        using var secondRefreshResponse = await client.PostAsJsonAsync(
            "/api/auth/refresh",
            new RefreshTokenRequest
            {
                RefreshToken = registerPayload?.RefreshToken ?? string.Empty
            });
        using var secondPayload = JsonDocument.Parse(await secondRefreshResponse.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, firstRefreshResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, secondRefreshResponse.StatusCode);
        Assert.Equal("invalid_refresh_token", secondPayload.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Profile_UpdateMe_UpdatesBaseFields_AndKeepsRole()
    {
        using var client = _factory.CreateClient();
        var email = BuildUniqueEmail();

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = "ValidPassword!123",
                FirstName = "Old",
                LastName = "Name",
                Role = RegisterUserRole.Executor
            });
        var registerPayload = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", registerPayload?.AccessToken);
        using var updateResponse = await client.PutAsJsonAsync(
            "/api/profile/me",
            new UpdateMyProfileRequest
            {
                FirstName = "New",
                LastName = "Value",
                Phone = "+79990000001"
            });
        var updatePayload = await updateResponse.Content.ReadFromJsonAsync<MyProfileResponse>();

        using var getResponse = await client.GetAsync("/api/profile/me");
        var getPayload = await getResponse.Content.ReadFromJsonAsync<MyProfileResponse>();

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        Assert.NotNull(updatePayload);
        Assert.Equal("New", updatePayload!.FirstName);
        Assert.Equal("Value", updatePayload.LastName);
        Assert.Equal("+79990000001", updatePayload.Phone);
        Assert.Equal("Executor", updatePayload.Role);

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        Assert.NotNull(getPayload);
        Assert.Equal("New", getPayload!.FirstName);
        Assert.Equal("Value", getPayload.LastName);
        Assert.Equal("+79990000001", getPayload.Phone);
        Assert.Equal("Executor", getPayload.Role);
    }

    [Fact]
    public async Task Profile_UpdateMe_WithForbiddenRoleSpecificPayload_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();
        var email = BuildUniqueEmail();

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = "ValidPassword!123",
                FirstName = "Applicant",
                LastName = "User",
                Role = RegisterUserRole.Applicant
            });
        var registerPayload = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", registerPayload?.AccessToken);
        using var updateResponse = await client.PutAsJsonAsync(
            "/api/profile/me",
            new UpdateMyProfileRequest
            {
                FirstName = "Applicant",
                LastName = "User",
                CustomerProfile = new CustomerProfileUpdateRequest
                {
                    Inn = "1234567890"
                }
            });

        using var errorPayload = JsonDocument.Parse(await updateResponse.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, updateResponse.StatusCode);
        Assert.Equal("invalid_role_specific_profile_payload", errorPayload.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Profile_SwitchMyActiveRole_FromApplicantToExecutor_ReturnsUpdatedProfile()
    {
        using var client = _factory.CreateClient();
        var email = BuildUniqueEmail();

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = "ValidPassword!123",
                FirstName = "Applicant",
                LastName = "User",
                Role = RegisterUserRole.Applicant
            });
        var registerPayload = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", registerPayload?.AccessToken);
        using var switchResponse = await client.PostAsJsonAsync(
            "/api/profile/me/active-role",
            new SwitchMyActiveRoleRequest
            {
                ActiveRole = ProfileUserRole.Executor
            });
        var switchPayload = await switchResponse.Content.ReadFromJsonAsync<MyProfileResponse>();

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, switchResponse.StatusCode);
        Assert.NotNull(switchPayload);
        Assert.Equal("Executor", switchPayload!.Role);
        Assert.Equal("Executor", switchPayload.ActiveRole);
        Assert.NotNull(switchPayload.Roles);
        Assert.Contains("Applicant", switchPayload.Roles);
        Assert.Contains("Executor", switchPayload.Roles);
    }

    [Fact]
    public async Task Profile_SwitchMyActiveRole_FromApplicantToCustomer_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();
        var email = BuildUniqueEmail();

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = "ValidPassword!123",
                FirstName = "Applicant",
                LastName = "User",
                Role = RegisterUserRole.Applicant
            });
        var registerPayload = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", registerPayload?.AccessToken);
        using var switchResponse = await client.PostAsJsonAsync(
            "/api/profile/me/active-role",
            new SwitchMyActiveRoleRequest
            {
                ActiveRole = ProfileUserRole.Customer
            });
        using var switchError = JsonDocument.Parse(await switchResponse.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, switchResponse.StatusCode);
        Assert.Equal("active_role_not_allowed", switchError.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Profile_UpdateMe_ExecutorRoleSpecificFields_AreSaved()
    {
        using var client = _factory.CreateClient();
        var email = BuildUniqueEmail();

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = "ValidPassword!123",
                FirstName = "Exec",
                LastName = "User",
                Role = RegisterUserRole.Executor
            });
        var registerPayload = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", registerPayload?.AccessToken);
        using var updateResponse = await client.PutAsJsonAsync(
            "/api/profile/me",
            new UpdateMyProfileRequest
            {
                FirstName = "Exec",
                LastName = "User",
                ExecutorProfile = new ExecutorProfileUpdateRequest
                {
                    EmploymentType = ExecutorEmploymentType.Smz,
                    ProjectTitle = "Project A",
                    Certificates = new List<string> { "Cert-1", "Cert-2" },
                    Grade = "Middle"
                }
            });
        var updatePayload = await updateResponse.Content.ReadFromJsonAsync<MyProfileResponse>();

        using var getResponse = await client.GetAsync("/api/profile/me");
        var getPayload = await getResponse.Content.ReadFromJsonAsync<MyProfileResponse>();

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        Assert.NotNull(updatePayload);
        Assert.NotNull(updatePayload!.ExecutorProfile);
        Assert.Equal(ExecutorEmploymentType.Smz, updatePayload.ExecutorProfile!.EmploymentType);
        Assert.Equal("Project A", updatePayload.ExecutorProfile.ProjectTitle);
        Assert.Equal("Middle", updatePayload.ExecutorProfile.Grade);
        Assert.NotNull(updatePayload.ExecutorProfile.Certificates);
        Assert.Equal(2, updatePayload.ExecutorProfile.Certificates!.Count);

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        Assert.NotNull(getPayload);
        Assert.NotNull(getPayload!.ExecutorProfile);
        Assert.Equal(ExecutorEmploymentType.Smz, getPayload.ExecutorProfile!.EmploymentType);
        Assert.Equal("Project A", getPayload.ExecutorProfile.ProjectTitle);
        Assert.Equal("Middle", getPayload.ExecutorProfile.Grade);
        Assert.NotNull(getPayload.ExecutorProfile.Certificates);
        Assert.Equal(2, getPayload.ExecutorProfile.Certificates!.Count);
    }

    [Fact]
    public async Task Profile_UpdateMe_ApplicantRoleSpecificFields_AreSaved()
    {
        using var client = _factory.CreateClient();
        var email = BuildUniqueEmail();

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = "ValidPassword!123",
                FirstName = "Applicant",
                LastName = "User",
                Role = RegisterUserRole.Applicant
            });
        var registerPayload = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", registerPayload?.AccessToken);
        using var updateResponse = await client.PutAsJsonAsync(
            "/api/profile/me",
            new UpdateMyProfileRequest
            {
                FirstName = "Applicant",
                LastName = "User",
                ApplicantProfile = new ApplicantProfileUpdateRequest
                {
                    ResumeTitle = "Senior C# Developer",
                    ExperienceSummary = "7 years in backend development",
                    Skills = new List<string> { "C#", ".NET" },
                    Certificates = new List<string> { "Azure Fundamentals" },
                    DesiredSalary = 250000.50m
                }
            });
        var updatePayload = await updateResponse.Content.ReadFromJsonAsync<MyProfileResponse>();

        using var getResponse = await client.GetAsync("/api/profile/me");
        var getPayload = await getResponse.Content.ReadFromJsonAsync<MyProfileResponse>();

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        Assert.NotNull(updatePayload);
        Assert.NotNull(updatePayload!.ApplicantProfile);
        Assert.Equal("Senior C# Developer", updatePayload.ApplicantProfile!.ResumeTitle);
        Assert.Equal("7 years in backend development", updatePayload.ApplicantProfile.ExperienceSummary);
        Assert.NotNull(updatePayload.ApplicantProfile.Skills);
        Assert.Equal(2, updatePayload.ApplicantProfile.Skills!.Count);
        Assert.Equal(250000.50m, updatePayload.ApplicantProfile.DesiredSalary);

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        Assert.NotNull(getPayload);
        Assert.NotNull(getPayload!.ApplicantProfile);
        Assert.Equal("Senior C# Developer", getPayload.ApplicantProfile!.ResumeTitle);
        Assert.Equal(250000.50m, getPayload.ApplicantProfile.DesiredSalary);
    }

    [Fact]
    public async Task Profile_UpdateMe_CustomerRoleSpecificFields_AreSaved()
    {
        using var client = _factory.CreateClient();
        var email = BuildUniqueEmail();

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = "ValidPassword!123",
                FirstName = "Customer",
                LastName = "User",
                Role = RegisterUserRole.Customer
            });
        var registerPayload = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", registerPayload?.AccessToken);
        using var updateResponse = await client.PutAsJsonAsync(
            "/api/profile/me",
            new UpdateMyProfileRequest
            {
                FirstName = "Customer",
                LastName = "User",
                CustomerProfile = new CustomerProfileUpdateRequest
                {
                    Inn = "1234567890",
                    Egrn = "1234567890123",
                    Egrnip = "123456789012345",
                    CompanyName = "ООО Тест",
                    CompanyLogoUrl = "https://example.com/logo.png"
                }
            });
        var updatePayload = await updateResponse.Content.ReadFromJsonAsync<MyProfileResponse>();

        using var getResponse = await client.GetAsync("/api/profile/me");
        var getPayload = await getResponse.Content.ReadFromJsonAsync<MyProfileResponse>();

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        Assert.NotNull(updatePayload);
        Assert.NotNull(updatePayload!.CustomerProfile);
        Assert.Equal("1234567890", updatePayload.CustomerProfile!.Inn);
        Assert.Equal("1234567890123", updatePayload.CustomerProfile.Egrn);
        Assert.Equal("123456789012345", updatePayload.CustomerProfile.Egrnip);
        Assert.Equal("ООО Тест", updatePayload.CustomerProfile.CompanyName);
        Assert.Equal("https://example.com/logo.png", updatePayload.CustomerProfile.CompanyLogoUrl);

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        Assert.NotNull(getPayload);
        Assert.NotNull(getPayload!.CustomerProfile);
        Assert.Equal("1234567890", getPayload.CustomerProfile!.Inn);
    }

    [Fact]
    public async Task Profile_UpdateMe_ExecutorWithUnsupportedEmploymentType_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();
        var email = BuildUniqueEmail();

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = "ValidPassword!123",
                FirstName = "Exec",
                LastName = "User",
                Role = RegisterUserRole.Executor
            });
        var registerPayload = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", registerPayload?.AccessToken);
        using var updateResponse = await client.PutAsJsonAsync(
            "/api/profile/me",
            new UpdateMyProfileRequest
            {
                FirstName = "Exec",
                LastName = "User",
                ExecutorProfile = new ExecutorProfileUpdateRequest
                {
                    EmploymentType = (ExecutorEmploymentType)999,
                    ProjectTitle = "Project A"
                }
            });
        using var errorPayload = JsonDocument.Parse(await updateResponse.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, updateResponse.StatusCode);
        Assert.Equal("invalid_role_specific_profile_payload", errorPayload.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Profile_UpdateMe_CustomerWithInvalidInn_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();
        var email = BuildUniqueEmail();

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = "ValidPassword!123",
                FirstName = "Customer",
                LastName = "User",
                Role = RegisterUserRole.Customer
            });
        var registerPayload = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", registerPayload?.AccessToken);
        using var updateResponse = await client.PutAsJsonAsync(
            "/api/profile/me",
            new UpdateMyProfileRequest
            {
                FirstName = "Customer",
                LastName = "User",
                CustomerProfile = new CustomerProfileUpdateRequest
                {
                    Inn = "12AB"
                }
            });
        using var errorPayload = JsonDocument.Parse(await updateResponse.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, updateResponse.StatusCode);
        Assert.Equal("invalid_role_specific_profile_payload", errorPayload.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Profile_UpdateMe_CustomerWithInvalidLogoUrl_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();
        var email = BuildUniqueEmail();

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = "ValidPassword!123",
                FirstName = "Customer",
                LastName = "User",
                Role = RegisterUserRole.Customer
            });
        var registerPayload = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", registerPayload?.AccessToken);
        using var updateResponse = await client.PutAsJsonAsync(
            "/api/profile/me",
            new UpdateMyProfileRequest
            {
                FirstName = "Customer",
                LastName = "User",
                CustomerProfile = new CustomerProfileUpdateRequest
                {
                    CompanyLogoUrl = "ftp://example.com/logo.png"
                }
            });
        using var errorPayload = JsonDocument.Parse(await updateResponse.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, updateResponse.StatusCode);
        Assert.Equal("invalid_role_specific_profile_payload", errorPayload.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Profile_UpdateMe_ApplicantWithInvalidSalaryPrecision_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();
        var email = BuildUniqueEmail();

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = email,
                Password = "ValidPassword!123",
                FirstName = "Applicant",
                LastName = "User",
                Role = RegisterUserRole.Applicant
            });
        var registerPayload = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", registerPayload?.AccessToken);
        using var updateResponse = await client.PutAsJsonAsync(
            "/api/profile/me",
            new UpdateMyProfileRequest
            {
                FirstName = "Applicant",
                LastName = "User",
                ApplicantProfile = new ApplicantProfileUpdateRequest
                {
                    DesiredSalary = 1000.123m
                }
            });
        using var errorPayload = JsonDocument.Parse(await updateResponse.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, updateResponse.StatusCode);
        Assert.Equal("invalid_role_specific_profile_payload", errorPayload.RootElement.GetProperty("code").GetString());
    }

    private static string BuildUniqueEmail()
    {
        return $"user-{Guid.NewGuid():N}@selectprofi.test";
    }
}
