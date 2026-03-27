using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace SelectProfi.backend.IntegrationTests;

[ApiController]
[Route("test/error-contract")]
public sealed class TestErrorContractController : ControllerBase
{
    [HttpPost("validation")]
    public IActionResult Validation([FromBody] ValidationRequest request)
    {
        return Ok(new { request.Name });
    }

    [HttpGet("exception")]
    public IActionResult Exception()
    {
        throw new InvalidOperationException("Unexpected failure.");
    }
}

public sealed class ValidationRequest
{
    [Required]
    public string? Name { get; init; }
}
