namespace SelectProfi.backend.Authentication;

public static class AuthorizationPolicies
{
    public const string CustomerOnly = "customer_only";
    public const string ExecutorOnly = "executor_only";
    public const string CustomerOrAdmin = "customer_or_admin";
    public const string CustomerAdminExecutor = "customer_admin_executor";
    public const string CustomerAdminExecutorApplicant = "customer_admin_executor_applicant";
}
