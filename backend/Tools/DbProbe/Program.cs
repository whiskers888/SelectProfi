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

    var mode = (Environment.GetEnvironmentVariable("DBPROBE_MODE") ?? "tables").Trim().ToLowerInvariant();
    var connectionString = BuildConnectionStringFromUrl(url);

    using var connection = new NpgsqlConnection(connectionString);
    connection.Open();

    using (var cmd = connection.CreateCommand())
    {
        cmd.CommandText = "SELECT 1";
        _ = cmd.ExecuteScalar();
    }

    Console.WriteLine("OK: connected and SELECT 1 succeeded.");

    var tables = ReadPublicTables(connection);

    if (mode is "tables")
        PrintTables(tables);
    else if (mode is "counts")
        PrintCounts(connection, tables);
    else if (mode is "schema")
        PrintSchema(connection, tables);
    else if (mode is "roles")
        PrintUserRoleCounts(connection);
    else if (mode is "users")
        PrintUsers(connection);
    else
        throw new InvalidOperationException($"Unknown DBPROBE_MODE='{mode}'. Use tables|counts|schema|roles|users.");

    return 0;
}
catch (Exception ex)
{
    Console.Error.WriteLine($"ERROR: {SanitizeException(ex)}");
    return 1;
}

static string BuildConnectionStringFromUrl(string url)
{
    // Do not print or persist the raw URL; it contains secrets.
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
        CommandTimeout = 10,
        Pooling = false
    };

    // Preserve optional query params (e.g., ?sslmode=require) but keep our secure defaults.
    if (!string.IsNullOrWhiteSpace(uri.Query))
    {
        var query = uri.Query.TrimStart('?');
        foreach (var part in query.Split('&', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var idx = part.IndexOf('=');
            if (idx <= 0)
                continue;

            var key = Uri.UnescapeDataString(part[..idx]);
            var value = Uri.UnescapeDataString(part[(idx + 1)..]);
            if (string.IsNullOrWhiteSpace(key))
                continue;

            // Only allow non-sensitive, non-overriding params.
            if (key.Equals("application_name", StringComparison.OrdinalIgnoreCase))
                builder.ApplicationName = value;
        }
    }

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
    // Avoid leaking connection strings in error output.
    var message = ex.Message ?? ex.GetType().Name;
    message = message.Replace("Password=", "Password=***", StringComparison.OrdinalIgnoreCase);
    message = message.Replace("password=", "password=***", StringComparison.OrdinalIgnoreCase);

    var sb = new StringBuilder();
    sb.Append(ex.GetType().Name);
    sb.Append(": ");
    sb.Append(message);
    return sb.ToString();
}

static List<string> ReadPublicTables(NpgsqlConnection connection)
{
    using var cmd = connection.CreateCommand();
    cmd.CommandText = """
                      SELECT table_name
                      FROM information_schema.tables
                      WHERE table_schema = 'public'
                        AND table_type = 'BASE TABLE'
                      ORDER BY table_name
                      """;

    using var reader = cmd.ExecuteReader();
    var tables = new List<string>();
    while (reader.Read())
        tables.Add(reader.GetString(0));
    return tables;
}

static void PrintTables(IReadOnlyCollection<string> tables)
{
    Console.WriteLine($"public tables ({tables.Count}): {string.Join(", ", tables)}");
}

static void PrintCounts(NpgsqlConnection connection, IReadOnlyCollection<string> tables)
{
    foreach (var table in tables)
    {
        using var cmd = connection.CreateCommand();
        cmd.CommandText = $"SELECT COUNT(*)::bigint FROM \"{table}\"";
        var count = (long)(cmd.ExecuteScalar() ?? 0L);
        Console.WriteLine($"{table}: {count}");
    }
}

static void PrintSchema(NpgsqlConnection connection, IReadOnlyCollection<string> tables)
{
    foreach (var table in tables.OrderBy(static x => x, StringComparer.Ordinal))
    {
        Console.WriteLine();
        Console.WriteLine($"== {table} ==");
        PrintColumns(connection, table);
        PrintPrimaryKey(connection, table);
        PrintForeignKeys(connection, table);
        PrintUniqueConstraints(connection, table);
    }
}

static void PrintUserRoleCounts(NpgsqlConnection connection)
{
    using var cmd = connection.CreateCommand();
    cmd.CommandText = """
                      SELECT "Role", COUNT(*)::bigint
                      FROM "Users"
                      GROUP BY "Role"
                      ORDER BY "Role"
                      """;

    using var reader = cmd.ExecuteReader();
    while (reader.Read())
        Console.WriteLine($"{reader.GetString(0)}: {reader.GetInt64(1)}");
}

static void PrintUsers(NpgsqlConnection connection)
{
    using var cmd = connection.CreateCommand();
    cmd.CommandText = """
                      SELECT "Email", "Role"
                      FROM "Users"
                      ORDER BY "Role", "Email"
                      """;

    using var reader = cmd.ExecuteReader();
    while (reader.Read())
        Console.WriteLine($"{reader.GetString(1)}\t{reader.GetString(0)}");
}

static void PrintColumns(NpgsqlConnection connection, string table)
{
    using var cmd = connection.CreateCommand();
    cmd.CommandText = """
                      SELECT
                          column_name,
                          data_type,
                          is_nullable,
                          character_maximum_length,
                          numeric_precision,
                          numeric_scale,
                          column_default
                      FROM information_schema.columns
                      WHERE table_schema = 'public'
                        AND table_name = $1
                      ORDER BY ordinal_position
                      """;
    cmd.Parameters.AddWithValue(table);

    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        var columnName = reader.GetString(0);
        var dataType = reader.GetString(1);
        var isNullable = reader.GetString(2);
        int? maxLen = reader.IsDBNull(3) ? null : reader.GetInt32(3);
        int? precision = reader.IsDBNull(4) ? null : reader.GetInt32(4);
        int? scale = reader.IsDBNull(5) ? null : reader.GetInt32(5);
        var def = reader.IsDBNull(6) ? null : reader.GetString(6);

        var extras = new List<string>();
        if (maxLen is not null) extras.Add($"len={maxLen}");
        if (precision is not null) extras.Add(scale is null ? $"prec={precision}" : $"prec={precision},scale={scale}");
        if (!string.IsNullOrWhiteSpace(def)) extras.Add($"default={def}");

        Console.WriteLine($"col {columnName}: {dataType} {(isNullable == "YES" ? "NULL" : "NOT NULL")}{(extras.Count == 0 ? "" : $" ({string.Join("; ", extras)})")}");
    }
}

static void PrintPrimaryKey(NpgsqlConnection connection, string table)
{
    using var cmd = connection.CreateCommand();
    cmd.CommandText = """
                      SELECT kcu.column_name
                      FROM information_schema.table_constraints tc
                      JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name = kcu.constraint_name
                       AND tc.table_schema = kcu.table_schema
                       AND tc.table_name = kcu.table_name
                      WHERE tc.table_schema = 'public'
                        AND tc.table_name = $1
                        AND tc.constraint_type = 'PRIMARY KEY'
                      ORDER BY kcu.ordinal_position
                      """;
    cmd.Parameters.AddWithValue(table);

    using var reader = cmd.ExecuteReader();
    var cols = new List<string>();
    while (reader.Read())
        cols.Add(reader.GetString(0));

    Console.WriteLine(cols.Count == 0 ? "pk: (none)" : $"pk: {string.Join(", ", cols)}");
}

static void PrintForeignKeys(NpgsqlConnection connection, string table)
{
    using var cmd = connection.CreateCommand();
    cmd.CommandText = """
                      SELECT
                          kcu.column_name,
                          ccu.table_name AS referenced_table,
                          ccu.column_name AS referenced_column
                      FROM information_schema.table_constraints tc
                      JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name = kcu.constraint_name
                       AND tc.table_schema = kcu.table_schema
                      JOIN information_schema.constraint_column_usage ccu
                        ON ccu.constraint_name = tc.constraint_name
                       AND ccu.table_schema = tc.table_schema
                      WHERE tc.table_schema = 'public'
                        AND tc.table_name = $1
                        AND tc.constraint_type = 'FOREIGN KEY'
                      ORDER BY kcu.column_name
                      """;
    cmd.Parameters.AddWithValue(table);

    using var reader = cmd.ExecuteReader();
    var any = false;
    while (reader.Read())
    {
        any = true;
        Console.WriteLine($"fk: {reader.GetString(0)} -> {reader.GetString(1)}.{reader.GetString(2)}");
    }

    if (!any)
        Console.WriteLine("fk: (none)");
}

static void PrintUniqueConstraints(NpgsqlConnection connection, string table)
{
    using var cmd = connection.CreateCommand();
    cmd.CommandText = """
                      SELECT
                          tc.constraint_name,
                          array_agg(kcu.column_name ORDER BY kcu.ordinal_position) AS columns
                      FROM information_schema.table_constraints tc
                      JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name = kcu.constraint_name
                       AND tc.table_schema = kcu.table_schema
                       AND tc.table_name = kcu.table_name
                      WHERE tc.table_schema = 'public'
                        AND tc.table_name = $1
                        AND tc.constraint_type = 'UNIQUE'
                      GROUP BY tc.constraint_name
                      ORDER BY tc.constraint_name
                      """;
    cmd.Parameters.AddWithValue(table);

    using var reader = cmd.ExecuteReader();
    var any = false;
    while (reader.Read())
    {
        any = true;
        var name = reader.GetString(0);
        var cols = reader.GetFieldValue<string[]>(1);
        Console.WriteLine($"uniq {name}: {string.Join(", ", cols)}");
    }

    if (!any)
        Console.WriteLine("uniq: (none)");
}
