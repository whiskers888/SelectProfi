using Microsoft.AspNetCore.Mvc;

namespace SelectProfi.backend.Controllers;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public sealed class ProducesBadRequestProblemAttribute : ProducesResponseTypeAttribute
{
    public ProducesBadRequestProblemAttribute() : base(typeof(ProblemDetails), StatusCodes.Status400BadRequest)
    {
    }
}

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public sealed class ProducesForbiddenProblemAttribute : ProducesResponseTypeAttribute
{
    public ProducesForbiddenProblemAttribute() : base(typeof(ProblemDetails), StatusCodes.Status403Forbidden)
    {
    }
}

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public sealed class ProducesConflictProblemAttribute : ProducesResponseTypeAttribute
{
    public ProducesConflictProblemAttribute() : base(typeof(ProblemDetails), StatusCodes.Status409Conflict)
    {
    }
}
