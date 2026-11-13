using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Domain.Wallets;

public sealed class Wallet
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public decimal AvailableBalance { get; set; }

    public decimal ReservedBalance { get; set; }

    public string CurrencyCode { get; set; } = "RUB";

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}
