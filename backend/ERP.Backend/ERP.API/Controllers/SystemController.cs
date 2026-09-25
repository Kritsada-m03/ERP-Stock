using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/system")]
public sealed class SystemController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult Health() => Ok(new
    {
        status = "ok",
        service = "ERP.API",
        databaseChecked = false
    });
}

