namespace SelectProfi.backend.Errors;

public readonly record struct ApiProblemDescriptor(
    int Status,
    string Title,
    string Code,
    string Detail);
