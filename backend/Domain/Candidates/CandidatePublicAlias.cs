namespace SelectProfi.backend.Domain.Candidates;

public static class CandidatePublicAlias
{
    public static string ForCandidate(Guid candidateId)
    {
        var suffix = candidateId.ToString("N")[..8].ToUpperInvariant();
        return $"Кандидат {suffix}";
    }
}
