using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using SelectProfi.backend.Contracts.Auth;
using SelectProfi.backend.Contracts.Profile;
using SelectProfi.backend.IntegrationTests.Infrastructure;
using Xunit;

namespace SelectProfi.backend.IntegrationTests;

public sealed class AuthVerificationHttpTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public AuthVerificationHttpTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task PhoneVerification_Register_Me_ReturnsPhoneAndNoEmail()
    {
        using var client = _factory.CreateClient();
        var phone = BuildUniquePhone();
        var password = "Passw0rd!";

        var token = await SendAndConfirmAsync(client, "Phone", phone);

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Phone = phone,
                Password = password,
                FirstName = "Phone",
                LastName = "User",
                Role = RegisterUserRole.Applicant,
                VerificationToken = token
            });
        var registerPayload = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", registerPayload?.AccessToken);
        using var meResponse = await client.GetAsync("/api/auth/me");
        using var mePayload = JsonDocument.Parse(await meResponse.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
        Assert.Equal(phone, mePayload.RootElement.GetProperty("phone").GetString());
        Assert.Equal(JsonValueKind.Null, mePayload.RootElement.GetProperty("email").ValueKind);
        Assert.Equal("Applicant", mePayload.RootElement.GetProperty("role").GetString());
    }

    [Fact]
    public async Task Login_ByPhone_AfterPhoneRegistration_Succeeds()
    {
        using var client = _factory.CreateClient();
        var phone = BuildUniquePhone();
        var password = "Passw0rd!";

        var token = await SendAndConfirmAsync(client, "Phone", phone);

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Phone = phone,
                Password = password,
                FirstName = "Phone",
                LastName = "Login",
                Role = RegisterUserRole.Applicant,
                VerificationToken = token
            });

        using var loginResponse = await client.PostAsJsonAsync(
            "/api/auth/login",
            new LoginUserRequest
            {
                Phone = phone,
                Password = password
            });
        var loginPayload = await loginResponse.Content.ReadFromJsonAsync<LoginUserResponse>();

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        Assert.NotNull(loginPayload);
        Assert.False(string.IsNullOrWhiteSpace(loginPayload!.AccessToken));
    }

    [Fact]
    public async Task Confirm_WithWrongCode_ReturnsInvalidCode_ThenAttemptsExceeded()
    {
        using var client = _factory.CreateClient();
        var phone = BuildUniquePhone();

        using var sendResponse = await client.PostAsJsonAsync(
            "/api/auth/verification/send",
            new SendVerificationCodeRequest
            {
                Channel = VerificationChannelContract.Phone,
                Target = phone
            });
        var sendPayload = await sendResponse.Content.ReadFromJsonAsync<SendVerificationCodeResponse>();

        Assert.Equal(HttpStatusCode.OK, sendResponse.StatusCode);
        Assert.NotNull(sendPayload);
        Assert.False(string.IsNullOrWhiteSpace(sendPayload!.DebugCode));

        var wrongCode = sendPayload.DebugCode == "000000" ? "111111" : "000000";

        for (var attempt = 0; attempt < 4; attempt++)
        {
            using var confirmResponse = await client.PostAsJsonAsync(
                "/api/auth/verification/confirm",
                new ConfirmVerificationCodeRequest
                {
                    ChallengeId = sendPayload.ChallengeId,
                    Code = wrongCode
                });
            using var confirmPayload = JsonDocument.Parse(await confirmResponse.Content.ReadAsStringAsync());

            Assert.Equal(HttpStatusCode.BadRequest, confirmResponse.StatusCode);
            Assert.Equal("invalid_verification_code", confirmPayload.RootElement.GetProperty("code").GetString());
        }

        using var exceededResponse = await client.PostAsJsonAsync(
            "/api/auth/verification/confirm",
            new ConfirmVerificationCodeRequest
            {
                ChallengeId = sendPayload.ChallengeId,
                Code = wrongCode
            });
        using var exceededPayload = JsonDocument.Parse(await exceededResponse.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.BadRequest, exceededResponse.StatusCode);
        Assert.Equal("verification_attempts_exceeded", exceededPayload.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Register_WithMismatchedVerificationToken_ReturnsMismatch()
    {
        using var client = _factory.CreateClient();
        var verifiedEmail = BuildUniqueEmail();
        var otherEmail = BuildUniqueEmail();

        var token = await SendAndConfirmAsync(client, "Email", verifiedEmail);

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = otherEmail,
                Password = "Passw0rd!",
                FirstName = "Mismatch",
                LastName = "User",
                Role = RegisterUserRole.Applicant,
                VerificationToken = token
            });
        using var payload = JsonDocument.Parse(await registerResponse.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.BadRequest, registerResponse.StatusCode);
        Assert.Equal("verification_token_mismatch", payload.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Register_WithNineCharacterPassword_Succeeds()
    {
        using var client = _factory.CreateClient();

        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = BuildUniqueEmail(),
                Password = "Passw0rd!",
                FirstName = "Short",
                LastName = "Password",
                Role = RegisterUserRole.Applicant
            });

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
    }

    [Fact]
    public async Task Profile_ExecutorInnAndOgrnip_RoundTrip()
    {
        using var client = _factory.CreateClient();
        var registerPayload = await RegisterAsync(client, RegisterUserRole.Executor);
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", registerPayload.AccessToken);

        using var updateResponse = await client.PutAsJsonAsync(
            "/api/profile/me",
            new UpdateMyProfileRequest
            {
                FirstName = "Exec",
                LastName = "User",
                ExecutorProfile = new ExecutorProfileUpdateRequest
                {
                    EmploymentType = ExecutorEmploymentType.Smz,
                    Inn = "772849102934",
                    Ogrnip = "321774600123456"
                }
            });
        var updatePayload = await updateResponse.Content.ReadFromJsonAsync<MyProfileResponse>();

        using var getResponse = await client.GetAsync("/api/profile/me");
        var getPayload = await getResponse.Content.ReadFromJsonAsync<MyProfileResponse>();

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        Assert.NotNull(updatePayload?.ExecutorProfile);
        Assert.Equal("772849102934", updatePayload!.ExecutorProfile!.Inn);
        Assert.Equal("321774600123456", updatePayload.ExecutorProfile.Ogrnip);

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        Assert.NotNull(getPayload?.ExecutorProfile);
        Assert.Equal("772849102934", getPayload!.ExecutorProfile!.Inn);
        Assert.Equal("321774600123456", getPayload.ExecutorProfile.Ogrnip);
    }

    [Fact]
    public async Task Profile_ApplicantJobSearchStatus_RoundTrip()
    {
        using var client = _factory.CreateClient();
        var registerPayload = await RegisterAsync(client, RegisterUserRole.Applicant);
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", registerPayload.AccessToken);

        using var updateResponse = await client.PutAsJsonAsync(
            "/api/profile/me",
            new UpdateMyProfileRequest
            {
                FirstName = "Applicant",
                LastName = "User",
                ApplicantProfile = new ApplicantProfileUpdateRequest
                {
                    JobSearchStatus = "Active",
                    ResumeTitle = "Senior Frontend-разработчик (React)"
                }
            });
        var updatePayload = await updateResponse.Content.ReadFromJsonAsync<MyProfileResponse>();

        using var getResponse = await client.GetAsync("/api/profile/me");
        var getPayload = await getResponse.Content.ReadFromJsonAsync<MyProfileResponse>();

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        Assert.NotNull(updatePayload?.ApplicantProfile);
        Assert.Equal("Active", updatePayload!.ApplicantProfile!.JobSearchStatus);
        Assert.Equal("Senior Frontend-разработчик (React)", updatePayload.ApplicantProfile.ResumeTitle);

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        Assert.NotNull(getPayload?.ApplicantProfile);
        Assert.Equal("Active", getPayload!.ApplicantProfile!.JobSearchStatus);
        Assert.Equal("Senior Frontend-разработчик (React)", getPayload.ApplicantProfile.ResumeTitle);
    }

    private static async Task<RegisterUserResponse> RegisterAsync(
        HttpClient client,
        RegisterUserRole role)
    {
        using var registerResponse = await client.PostAsJsonAsync(
            "/api/auth/register",
            new RegisterUserRequest
            {
                Email = BuildUniqueEmail(),
                Password = "Passw0rd!",
                FirstName = "Profile",
                LastName = "User",
                Role = role
            });

        registerResponse.EnsureSuccessStatusCode();
        var payload = await registerResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();

        return payload ?? throw new InvalidOperationException("Register response is empty.");
    }

    private static async Task<string> SendAndConfirmAsync(HttpClient client, string channel, string target)
    {
        using var sendResponse = await client.PostAsJsonAsync(
            "/api/auth/verification/send",
            new SendVerificationCodeRequest
            {
                Channel = channel == "Phone"
                    ? VerificationChannelContract.Phone
                    : VerificationChannelContract.Email,
                Target = target
            });
        var sendPayload = await sendResponse.Content.ReadFromJsonAsync<SendVerificationCodeResponse>();

        if (sendResponse.StatusCode != HttpStatusCode.OK || sendPayload?.DebugCode is null)
            throw new InvalidOperationException(
                $"Verification send failed: {sendResponse.StatusCode} {await sendResponse.Content.ReadAsStringAsync()}");

        using var confirmResponse = await client.PostAsJsonAsync(
            "/api/auth/verification/confirm",
            new ConfirmVerificationCodeRequest
            {
                ChallengeId = sendPayload.ChallengeId,
                Code = sendPayload.DebugCode
            });
        var confirmPayload = await confirmResponse.Content.ReadFromJsonAsync<ConfirmVerificationCodeResponse>();

        if (confirmResponse.StatusCode != HttpStatusCode.OK || confirmPayload is null)
            throw new InvalidOperationException(
                $"Verification confirm failed: {confirmResponse.StatusCode} {await confirmResponse.Content.ReadAsStringAsync()}");

        return confirmPayload.VerificationToken;
    }

    private static string BuildUniqueEmail()
    {
        return $"user-{Guid.NewGuid():N}@selectprofi.test";
    }

    private static string BuildUniquePhone()
    {
        var suffix = Random.Shared.Next(1_000_000, 9_999_999);

        return $"+7999{suffix:D7}";
    }
}
