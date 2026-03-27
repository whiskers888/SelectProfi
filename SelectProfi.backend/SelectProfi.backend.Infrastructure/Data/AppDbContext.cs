using Microsoft.EntityFrameworkCore;

namespace SelectProfi.backend.Infrastructure.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
}
