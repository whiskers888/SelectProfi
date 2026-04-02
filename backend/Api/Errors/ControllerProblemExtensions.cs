using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace SelectProfi.backend.Errors;

public static class ControllerProblemExtensions
{
    public static IActionResult ToProblem(this ControllerBase controller, ApiProblemDescriptor descriptor)
    {
        var problemDetails = new ProblemDetails
        {
            Type = $"https://httpstatuses.com/{descriptor.Status}",
            Title = descriptor.Title,
            Status = descriptor.Status,
            Detail = descriptor.Detail,
            Instance = controller.HttpContext.Request.Path
        };

        problemDetails.Extensions["code"] = descriptor.Code;
        problemDetails.Extensions["traceId"] = Activity.Current?.Id ?? controller.HttpContext.TraceIdentifier;

        return new ObjectResult(problemDetails)
        {
            StatusCode = descriptor.Status,
            ContentTypes = { "application/problem+json" }
        };
    }
}
