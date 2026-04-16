using System.Security.Cryptography;
using System.Text;
using Npgsql;

try
{
    var url = Environment.GetEnvironmentVariable("SELECTPROFI_DB_URL");
    if (string.IsNullOrWhiteSpace(url))
    {
        Console.Error.WriteLine("Missing env SELECTPROFI_DB_URL.");
        return 2;
    }

    var now = DateTime.UtcNow;
    var connectionString = BuildConnectionStringFromUrl(url);

    await using var connection = new NpgsqlConnection(connectionString);
    await connection.OpenAsync();

    await using var tx = await connection.BeginTransactionAsync();

    var users = await SeedUsersAsync(connection, tx, now);
    var specs = await SeedOrderSpecializationsAsync(connection, tx, now);
    var orders = await SeedOrdersAsync(connection, tx, users, specs, now);
    var vacancies = await SeedVacanciesAsync(connection, tx, users, orders, now);
    var candidates = await SeedCandidatesAsync(connection, tx, users, now);
    await SeedCandidateResumesAsync(connection, tx, users, candidates, now);
    var vacancyCandidates = await SeedVacancyCandidatesAsync(connection, tx, users, vacancies, candidates, now);
    await SeedOrderExecutorResponsesAsync(connection, tx, users, orders, now);
    await UpdateSelectedCandidatesAsync(connection, tx, vacancies, vacancyCandidates, now);

    await tx.CommitAsync();

    await PrintCountsAsync(connection);
    Console.WriteLine("OK: seed completed.");
    return 0;
}
catch (Exception ex)
{
    Console.Error.WriteLine($"ERROR: {SanitizeException(ex)}");
    return 1;
}

static async Task<Dictionary<string, Guid>> SeedUsersAsync(NpgsqlConnection connection, NpgsqlTransaction tx, DateTime now)
{
    var seed = new List<(string Email, string FirstName, string LastName, string Role)>
    {
        ("executor@selectprofi.local", "Test", "Executor", "Executor"),
        ("executor2@selectprofi.local", "Test", "Executor2", "Executor"),
        ("executor3@selectprofi.local", "Test", "Executor3", "Executor"),

        ("applicant@selectprofi.local", "Test", "Applicant", "Applicant"),
        ("applicant2@selectprofi.local", "Test", "Applicant2", "Applicant"),
        ("applicant3@selectprofi.local", "Test", "Applicant3", "Applicant"),

        ("customer@selectprofi.local", "Test", "Customer", "Customer"),
        ("customer2@selectprofi.local", "Test", "Customer2", "Customer"),
        ("customer3@selectprofi.local", "Test", "Customer3", "Customer"),

        ("admin@selectprofi.local", "Test", "Admin", "Admin"),
        ("admin2@selectprofi.local", "Test", "Admin2", "Admin"),
        ("admin3@selectprofi.local", "Test", "Admin3", "Admin")
    };

    foreach (var item in seed)
    {
        var normalizedEmail = item.Email.Trim().ToUpperInvariant();
        var passwordHash = HashPassword("1");

        await ExecAsync(
            connection,
            tx,
            """
            INSERT INTO "Users" (
                "Id","Email","NormalizedEmail","PasswordHash","FirstName","LastName","Role",
                "IsEmailVerified","IsPhoneVerified","CreatedAtUtc"
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            ON CONFLICT ("NormalizedEmail") DO UPDATE SET
                "Email" = EXCLUDED."Email",
                "PasswordHash" = EXCLUDED."PasswordHash",
                "FirstName" = EXCLUDED."FirstName",
                "LastName" = EXCLUDED."LastName",
                "Role" = EXCLUDED."Role",
                "IsEmailVerified" = EXCLUDED."IsEmailVerified",
                "IsPhoneVerified" = EXCLUDED."IsPhoneVerified"
            """,
            DeterministicGuid($"user:{normalizedEmail}"),
            item.Email,
            normalizedEmail,
            passwordHash,
            item.FirstName,
            item.LastName,
            item.Role,
            true,
            true,
            now);
    }

    var dict = new Dictionary<string, Guid>(StringComparer.Ordinal);
    foreach (var item in seed)
    {
        var normalizedEmail = item.Email.Trim().ToUpperInvariant();
        var id = await ScalarAsync<Guid>(
            connection,
            tx,
            """SELECT "Id" FROM "Users" WHERE "NormalizedEmail" = $1""",
            normalizedEmail);
        dict[normalizedEmail] = id;
    }

    return dict;
}

static async Task<List<(Guid Id, string Name)>> SeedOrderSpecializationsAsync(NpgsqlConnection connection, NpgsqlTransaction tx, DateTime now)
{
    var names = new[]
    {
        "Backend-разработка",
        "Frontend-разработка",
        "Mobile-разработка",
        "QA / Тестирование",
        "DevOps / SRE",
        "Data / Analytics"
    };

    var result = new List<(Guid, string)>(names.Length);

    for (var i = 0; i < names.Length; i++)
    {
        var id = DeterministicGuid($"order-specialization:{names[i]}");
        await ExecAsync(
            connection,
            tx,
            """
            INSERT INTO "OrderSpecializations" (
                "Id","Name","IsActive","SortOrder","CreatedAtUtc","UpdatedAtUtc"
            )
            VALUES ($1,$2,$3,$4,$5,$6)
            ON CONFLICT ("Id") DO UPDATE SET
                "Name" = EXCLUDED."Name",
                "IsActive" = EXCLUDED."IsActive",
                "SortOrder" = EXCLUDED."SortOrder",
                "UpdatedAtUtc" = EXCLUDED."UpdatedAtUtc"
            """,
            id,
            names[i],
            true,
            i,
            now,
            now);

        result.Add((id, names[i]));
    }

    return result;
}

static async Task<List<Guid>> SeedOrdersAsync(
    NpgsqlConnection connection,
    NpgsqlTransaction tx,
    Dictionary<string, Guid> users,
    List<(Guid Id, string Name)> specs,
    DateTime now)
{
    var customers = users
        .Where(kv => kv.Key.StartsWith("CUSTOMER", StringComparison.Ordinal))
        .OrderBy(kv => kv.Key, StringComparer.Ordinal)
        .Select(kv => kv.Value)
        .ToArray();
    var executors = users
        .Where(kv => kv.Key.StartsWith("EXECUTOR", StringComparison.Ordinal))
        .OrderBy(kv => kv.Key, StringComparer.Ordinal)
        .Select(kv => kv.Value)
        .ToArray();

    var orders = new List<Guid>(8);
    for (var i = 1; i <= 8; i++)
    {
        var spec = specs[(i - 1) % specs.Count];
        var customerId = customers[(i - 1) % customers.Length];
        var executorId = i % 2 == 0 ? executors[(i - 1) % executors.Length] : (Guid?)null;

        var id = DeterministicGuid($"order:{i}");
        await ExecAsync(
            connection,
            tx,
            """
            INSERT INTO "Orders" (
                "Id","CustomerId","ExecutorId","Title","Description",
                "RequestedCandidatesCount","Status","CustomerCompanyName","Price",
                "Specialization","SpecializationId",
                "CreatedAtUtc","UpdatedAtUtc","DeletedAtUtc"
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
            ON CONFLICT ("Id") DO UPDATE SET
                "CustomerId" = EXCLUDED."CustomerId",
                "ExecutorId" = EXCLUDED."ExecutorId",
                "Title" = EXCLUDED."Title",
                "Description" = EXCLUDED."Description",
                "RequestedCandidatesCount" = EXCLUDED."RequestedCandidatesCount",
                "Status" = EXCLUDED."Status",
                "CustomerCompanyName" = EXCLUDED."CustomerCompanyName",
                "Price" = EXCLUDED."Price",
                "Specialization" = EXCLUDED."Specialization",
                "SpecializationId" = EXCLUDED."SpecializationId",
                "UpdatedAtUtc" = EXCLUDED."UpdatedAtUtc"
            """,
            id,
            customerId,
            executorId,
            $"Заказ #{i}: {spec.Name}",
            $"Тестовый заказ #{i} для проверки витрин фронта.",
            3 + (i % 3),
            "Active",
            $"ООО Тест Компания {(i - 1) % customers.Length + 1}",
            150000m + i * 10000m,
            spec.Name,
            spec.Id,
            now,
            now,
            DBNull.Value);

        orders.Add(id);
    }

    return orders;
}

static async Task<List<Guid>> SeedVacanciesAsync(
    NpgsqlConnection connection,
    NpgsqlTransaction tx,
    Dictionary<string, Guid> users,
    List<Guid> orders,
    DateTime now)
{
    var executors = users
        .Where(kv => kv.Key.StartsWith("EXECUTOR", StringComparison.Ordinal))
        .OrderBy(kv => kv.Key, StringComparer.Ordinal)
        .Select(kv => kv.Value)
        .ToArray();

    var vacancies = new List<Guid>(orders.Count);
    for (var i = 0; i < orders.Count; i++)
    {
        var orderId = orders[i];
        var (customerId, executorId) = await ReadOrderOwnersAsync(connection, tx, orderId);
        executorId ??= executors[i % executors.Length];

        var status = i % 3 == 0 ? "Published" : i % 3 == 1 ? "OnApproval" : "Draft";
        var shortlistSent = status == "Published" ? now.AddMinutes(-30) : (DateTime?)null;

        var id = DeterministicGuid($"vacancy:{i + 1}");
        await ExecAsync(
            connection,
            tx,
            """
            INSERT INTO "Vacancies" (
                "Id","OrderId","CustomerId","ExecutorId",
                "Title","Description","Status",
                "CreatedAtUtc","UpdatedAtUtc","ShortlistSentToCustomerAtUtc","SelectedCandidateId","DeletedAtUtc"
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            ON CONFLICT ("Id") DO UPDATE SET
                "OrderId" = EXCLUDED."OrderId",
                "CustomerId" = EXCLUDED."CustomerId",
                "ExecutorId" = EXCLUDED."ExecutorId",
                "Title" = EXCLUDED."Title",
                "Description" = EXCLUDED."Description",
                "Status" = EXCLUDED."Status",
                "ShortlistSentToCustomerAtUtc" = EXCLUDED."ShortlistSentToCustomerAtUtc",
                "UpdatedAtUtc" = EXCLUDED."UpdatedAtUtc",
                "DeletedAtUtc" = EXCLUDED."DeletedAtUtc"
            """,
            id,
            orderId,
            customerId,
            executorId.Value,
            $"Вакансия #{i + 1} по заказу {orderId}",
            $"Тестовая вакансия #{i + 1}.",
            status,
            now,
            now,
            shortlistSent ?? (object)DBNull.Value,
            DBNull.Value,
            DBNull.Value);

        vacancies.Add(id);
    }

    return vacancies;
}

static async Task<List<(Guid Id, Guid? UserId)>> SeedCandidatesAsync(
    NpgsqlConnection connection,
    NpgsqlTransaction tx,
    Dictionary<string, Guid> users,
    DateTime now)
{
    var executors = users
        .Where(kv => kv.Key.StartsWith("EXECUTOR", StringComparison.Ordinal))
        .OrderBy(kv => kv.Key, StringComparer.Ordinal)
        .Select(kv => kv.Value)
        .ToArray();
    var applicants = users
        .Where(kv => kv.Key.StartsWith("APPLICANT", StringComparison.Ordinal))
        .OrderBy(kv => kv.Key, StringComparer.Ordinal)
        .Select(kv => new { NormalizedEmail = kv.Key, Id = kv.Value })
        .ToArray();

    var result = new List<(Guid, Guid?)>();

    for (var i = 0; i < applicants.Length; i++)
    {
        var applicant = applicants[i];
        var candidateId = DeterministicGuid($"candidate:registered:{applicant.NormalizedEmail}");
        var fullName = $"Test Applicant{i + 1}";

        await ExecAsync(
            connection,
            tx,
            """
            INSERT INTO "Candidates" (
                "Id","UserId","CreatedByExecutorId",
                "FullName","NormalizedFullName","PublicAlias",
                "Email","NormalizedEmail",
                "Phone","NormalizedPhone",
                "ContactsOwnerExecutorId","ContactsAccessExpiresAtUtc",
                "Source","CreatedAtUtc","UpdatedAtUtc","DeletedAtUtc","BirthDate"
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
            ON CONFLICT ("Id") DO UPDATE SET
                "UserId" = EXCLUDED."UserId",
                "FullName" = EXCLUDED."FullName",
                "NormalizedFullName" = EXCLUDED."NormalizedFullName",
                "PublicAlias" = EXCLUDED."PublicAlias",
                "Email" = EXCLUDED."Email",
                "NormalizedEmail" = EXCLUDED."NormalizedEmail",
                "Source" = EXCLUDED."Source",
                "BirthDate" = EXCLUDED."BirthDate",
                "UpdatedAtUtc" = EXCLUDED."UpdatedAtUtc"
            """,
            candidateId,
            applicant.Id,
            DBNull.Value,
            fullName,
            fullName.ToUpperInvariant(),
            $"Applicant {i + 1}",
            $"{applicant.NormalizedEmail.ToLowerInvariant()}@example.invalid",
            $"{applicant.NormalizedEmail}@EXAMPLE.INVALID",
            DBNull.Value,
            DBNull.Value,
            DBNull.Value,
            DBNull.Value,
            "RegisteredUser",
            now,
            now,
            DBNull.Value,
            new DateOnly(1995 + i, 1 + (i % 12), 1 + (i % 20)));

        result.Add((candidateId, applicant.Id));
    }

    for (var i = 1; i <= 6; i++)
    {
        var executorId = executors[(i - 1) % executors.Length];
        var candidateId = DeterministicGuid($"candidate:base:{i}");
        var fullName = $"Кандидат База {i}";

        await ExecAsync(
            connection,
            tx,
            """
            INSERT INTO "Candidates" (
                "Id","UserId","CreatedByExecutorId",
                "FullName","NormalizedFullName","PublicAlias",
                "Email","NormalizedEmail",
                "Phone","NormalizedPhone",
                "ContactsOwnerExecutorId","ContactsAccessExpiresAtUtc",
                "Source","CreatedAtUtc","UpdatedAtUtc","DeletedAtUtc","BirthDate"
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
            ON CONFLICT ("Id") DO UPDATE SET
                "CreatedByExecutorId" = EXCLUDED."CreatedByExecutorId",
                "FullName" = EXCLUDED."FullName",
                "NormalizedFullName" = EXCLUDED."NormalizedFullName",
                "PublicAlias" = EXCLUDED."PublicAlias",
                "Email" = EXCLUDED."Email",
                "NormalizedEmail" = EXCLUDED."NormalizedEmail",
                "ContactsOwnerExecutorId" = EXCLUDED."ContactsOwnerExecutorId",
                "ContactsAccessExpiresAtUtc" = EXCLUDED."ContactsAccessExpiresAtUtc",
                "Source" = EXCLUDED."Source",
                "BirthDate" = EXCLUDED."BirthDate",
                "UpdatedAtUtc" = EXCLUDED."UpdatedAtUtc"
            """,
            candidateId,
            DBNull.Value,
            executorId,
            fullName,
            fullName.ToUpperInvariant(),
            $"Кандидат #{i}",
            $"candidate{i}@example.local",
            $"CANDIDATE{i}@EXAMPLE.LOCAL",
            DBNull.Value,
            DBNull.Value,
            executorId,
            now.AddDays(7),
            "AddedByExecutor",
            now,
            now,
            DBNull.Value,
            new DateOnly(1990 + i, 5, 10));

        result.Add((candidateId, null));
    }

    return result;
}

static async Task SeedCandidateResumesAsync(
    NpgsqlConnection connection,
    NpgsqlTransaction tx,
    Dictionary<string, Guid> users,
    List<(Guid Id, Guid? UserId)> candidates,
    DateTime now)
{
    var executors = users
        .Where(kv => kv.Key.StartsWith("EXECUTOR", StringComparison.Ordinal))
        .OrderBy(kv => kv.Key, StringComparer.Ordinal)
        .Select(kv => kv.Value)
        .ToArray();

    for (var i = 0; i < candidates.Count; i++)
    {
        var candidate = candidates[i];
        var ownerUserId = candidate.UserId ?? executors[i % executors.Length];
        var resumeId = DeterministicGuid($"resume:{candidate.Id}");

        await ExecAsync(
            connection,
            tx,
            """
            INSERT INTO "CandidateResumes" (
                "Id","CandidateId","OwnerUserId","Title","ContentJson","AttachmentsJson",
                "PdfExportAllowed","CreatedAtUtc","UpdatedAtUtc","DeletedAtUtc"
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            ON CONFLICT ("Id") DO UPDATE SET
                "CandidateId" = EXCLUDED."CandidateId",
                "OwnerUserId" = EXCLUDED."OwnerUserId",
                "Title" = EXCLUDED."Title",
                "ContentJson" = EXCLUDED."ContentJson",
                "PdfExportAllowed" = EXCLUDED."PdfExportAllowed",
                "UpdatedAtUtc" = EXCLUDED."UpdatedAtUtc"
            """,
            resumeId,
            candidate.Id,
            ownerUserId,
            $"Резюме #{i + 1}",
            """{"summary":"seed","skills":["C#","SQL"]}""",
            DBNull.Value,
            true,
            now,
            now,
            DBNull.Value);
    }
}

static async Task<List<(Guid VacancyId, Guid CandidateId, string Stage)>> SeedVacancyCandidatesAsync(
    NpgsqlConnection connection,
    NpgsqlTransaction tx,
    Dictionary<string, Guid> users,
    List<Guid> vacancies,
    List<(Guid Id, Guid? UserId)> candidates,
    DateTime now)
{
    var executors = users
        .Where(kv => kv.Key.StartsWith("EXECUTOR", StringComparison.Ordinal))
        .OrderBy(kv => kv.Key, StringComparer.Ordinal)
        .Select(kv => kv.Value)
        .ToArray();

    var result = new List<(Guid, Guid, string)>();

    for (var i = 0; i < vacancies.Count; i++)
    {
        var vacancyId = vacancies[i];
        var executorId = executors[i % executors.Length];

        var start = (i * 2) % candidates.Count;
        var pair = new[]
        {
            candidates[start].Id,
            candidates[(start + 1) % candidates.Count].Id
        };

        for (var j = 0; j < pair.Length; j++)
        {
            var candidateId = pair[j];
            var stage = j == 0 ? "Pool" : "Shortlist";
            var id = DeterministicGuid($"vacancy-candidate:{vacancyId}:{candidateId}");

            await ExecAsync(
                connection,
                tx,
                """
                INSERT INTO "VacancyCandidates" (
                    "Id","VacancyId","CandidateId","AddedByExecutorId","Stage",
                    "AddedAtUtc","UpdatedAtUtc","DeletedAtUtc","ViewedByCustomerAtUtc"
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
                ON CONFLICT ("Id") DO UPDATE SET
                    "VacancyId" = EXCLUDED."VacancyId",
                    "CandidateId" = EXCLUDED."CandidateId",
                    "AddedByExecutorId" = EXCLUDED."AddedByExecutorId",
                    "Stage" = EXCLUDED."Stage",
                    "UpdatedAtUtc" = EXCLUDED."UpdatedAtUtc"
                """,
                id,
                vacancyId,
                candidateId,
                executorId,
                stage,
                now.AddMinutes(-10 - i),
                now,
                DBNull.Value,
                DBNull.Value);

            result.Add((vacancyId, candidateId, stage));
        }
    }

    return result;
}

static async Task SeedOrderExecutorResponsesAsync(
    NpgsqlConnection connection,
    NpgsqlTransaction tx,
    Dictionary<string, Guid> users,
    List<Guid> orders,
    DateTime now)
{
    var executors = users
        .Where(kv => kv.Key.StartsWith("EXECUTOR", StringComparison.Ordinal))
        .OrderBy(kv => kv.Key, StringComparer.Ordinal)
        .Select(kv => kv.Value)
        .ToArray();

    for (var i = 0; i < orders.Count; i++)
    {
        var orderId = orders[i];
        var executorId = executors[i % executors.Length];
        var status = i % 4 == 0 ? "Accepted" : i % 4 == 1 ? "Pending" : i % 4 == 2 ? "Rejected" : "Withdrawn";
        var id = DeterministicGuid($"order-response:{orderId}:{executorId}");

        await ExecAsync(
            connection,
            tx,
            """
            INSERT INTO "OrderExecutorResponses" (
                "Id","OrderId","ExecutorId","Status","CreatedAtUtc","UpdatedAtUtc"
            )
            VALUES ($1,$2,$3,$4,$5,$6)
            ON CONFLICT ("Id") DO UPDATE SET
                "OrderId" = EXCLUDED."OrderId",
                "ExecutorId" = EXCLUDED."ExecutorId",
                "Status" = EXCLUDED."Status",
                "UpdatedAtUtc" = EXCLUDED."UpdatedAtUtc"
            """,
            id,
            orderId,
            executorId,
            status,
            now.AddMinutes(-20 - i),
            now);
    }
}

static async Task UpdateSelectedCandidatesAsync(
    NpgsqlConnection connection,
    NpgsqlTransaction tx,
    List<Guid> vacancies,
    List<(Guid VacancyId, Guid CandidateId, string Stage)> vacancyCandidates,
    DateTime now)
{
    var shortlistByVacancy = vacancyCandidates
        .Where(x => string.Equals(x.Stage, "Shortlist", StringComparison.Ordinal))
        .GroupBy(x => x.VacancyId)
        .ToDictionary(g => g.Key, g => g.First().CandidateId);

    foreach (var vacancyId in vacancies)
    {
        var status = await ScalarAsync<string>(
            connection,
            tx,
            """SELECT "Status" FROM "Vacancies" WHERE "Id" = $1""",
            vacancyId);

        if (!string.Equals(status, "Published", StringComparison.Ordinal))
            continue;

        if (!shortlistByVacancy.TryGetValue(vacancyId, out var candidateId))
            continue;

        await ExecAsync(
            connection,
            tx,
            """
            UPDATE "Vacancies"
            SET "SelectedCandidateId" = $1,
                "UpdatedAtUtc" = $2
            WHERE "Id" = $3
            """,
            candidateId,
            now,
            vacancyId);
    }
}

static async Task<(Guid CustomerId, Guid? ExecutorId)> ReadOrderOwnersAsync(
    NpgsqlConnection connection,
    NpgsqlTransaction tx,
    Guid orderId)
{
    await using var cmd = new NpgsqlCommand("""SELECT "CustomerId","ExecutorId" FROM "Orders" WHERE "Id" = $1""", connection, tx);
    cmd.Parameters.AddWithValue(orderId);
    await using var reader = await cmd.ExecuteReaderAsync();
    if (!await reader.ReadAsync())
        throw new InvalidOperationException("Order not found while seeding vacancies.");

    var customerId = reader.GetGuid(0);
    var executorId = reader.IsDBNull(1) ? (Guid?)null : reader.GetGuid(1);
    return (customerId, executorId);
}

static async Task PrintCountsAsync(NpgsqlConnection connection)
{
    static async Task<long> CountAsync(NpgsqlConnection connection, string table)
    {
        await using var cmd = new NpgsqlCommand($"SELECT COUNT(*)::bigint FROM \"{table}\"", connection);
        var value = await cmd.ExecuteScalarAsync();
        return value is long count ? count : Convert.ToInt64(value);
    }

    var tables = new[]
    {
        "Users",
        "OrderSpecializations",
        "Orders",
        "Vacancies",
        "Candidates",
        "CandidateResumes",
        "VacancyCandidates",
        "OrderExecutorResponses"
    };

    Console.WriteLine("Counts:");
    foreach (var t in tables)
        Console.WriteLine($"{t}: {await CountAsync(connection, t)}");
}

static async Task ExecAsync(NpgsqlConnection connection, NpgsqlTransaction tx, string sql, params object?[] args)
{
    await using var cmd = new NpgsqlCommand(sql, connection, tx);
    for (var i = 0; i < args.Length; i++)
        cmd.Parameters.AddWithValue(args[i] ?? DBNull.Value);
    await cmd.ExecuteNonQueryAsync();
}

static async Task<T> ScalarAsync<T>(NpgsqlConnection connection, NpgsqlTransaction tx, string sql, params object?[] args)
{
    await using var cmd = new NpgsqlCommand(sql, connection, tx);
    for (var i = 0; i < args.Length; i++)
        cmd.Parameters.AddWithValue(args[i] ?? DBNull.Value);
    var value = await cmd.ExecuteScalarAsync();
    if (value is null || value is DBNull)
        throw new InvalidOperationException("Unexpected NULL scalar result.");
    return (T)Convert.ChangeType(value, typeof(T));
}

static string HashPassword(string password)
{
    if (string.IsNullOrWhiteSpace(password))
        throw new ArgumentException("Password is required.", nameof(password));

    const int saltSize = 16;
    const int hashSize = 32;
    const int iterations = 100_000;

    var salt = RandomNumberGenerator.GetBytes(saltSize);
    var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, hashSize);
    return $"pbkdf2-sha256${iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
}

static Guid DeterministicGuid(string key)
{
    var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(key));
    return new Guid(bytes.AsSpan(0, 16));
}

static string BuildConnectionStringFromUrl(string url)
{
    if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
        throw new InvalidOperationException("Invalid DB URL (expected absolute URI).");

    if (!string.Equals(uri.Scheme, "postgresql", StringComparison.OrdinalIgnoreCase)
        && !string.Equals(uri.Scheme, "postgres", StringComparison.OrdinalIgnoreCase))
        throw new InvalidOperationException("Invalid DB URL scheme (expected postgresql:// or postgres://).");

    var (username, password) = ParseUserInfo(uri.UserInfo);
    var database = uri.AbsolutePath.Trim('/').Trim();
    if (string.IsNullOrWhiteSpace(database))
        throw new InvalidOperationException("Invalid DB URL (missing database name in path).");

    var builder = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.IsDefaultPort ? 5432 : uri.Port,
        Database = database,
        Username = username,
        Password = password,
        SslMode = SslMode.Require,
        Timeout = 10,
        CommandTimeout = 30,
        KeepAlive = 5,
        Pooling = false
    };

    return builder.ConnectionString;
}

static (string Username, string Password) ParseUserInfo(string userInfo)
{
    if (string.IsNullOrWhiteSpace(userInfo))
        throw new InvalidOperationException("Invalid DB URL (missing user info).");

    var idx = userInfo.IndexOf(':');
    if (idx <= 0 || idx == userInfo.Length - 1)
        throw new InvalidOperationException("Invalid DB URL (expected user:password).");

    var username = Uri.UnescapeDataString(userInfo[..idx]);
    var password = Uri.UnescapeDataString(userInfo[(idx + 1)..]);

    if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        throw new InvalidOperationException("Invalid DB URL (empty user or password).");

    return (username, password);
}

static string SanitizeException(Exception ex)
{
    var parts = new List<string>();
    for (var current = ex; current is not null; current = current.InnerException)
        parts.Add($"{current.GetType().Name}: {SanitizeMessage(current.Message)}");
    return string.Join(" | ", parts);
}

static string SanitizeMessage(string? message)
{
    if (string.IsNullOrWhiteSpace(message))
        return "(no message)";

    return message
        .Replace("Password=", "Password=***", StringComparison.OrdinalIgnoreCase)
        .Replace("password=", "password=***", StringComparison.OrdinalIgnoreCase);
}
