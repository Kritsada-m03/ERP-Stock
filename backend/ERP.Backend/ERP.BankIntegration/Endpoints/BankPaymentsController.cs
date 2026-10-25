using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;
using ERP.BankIntegration.Clients;
using ERP.BankIntegration.Configuration;
using ERP.BankIntegration.Contracts;
using ERP.BankIntegration.Services;
using ERP.BankIntegration.Storage;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace ERP.BankIntegration.Endpoints;

[ApiController]
[Route("api/banking")]
[ServiceFilter(typeof(BankDevelopmentOnlyFilter))]
public sealed class BankPaymentsController(BankExchangeService service, IOptions<BankIntegrationOptions> options) : ControllerBase
{
    [HttpPost("payments")]
    public async Task<ActionResult<BankPaymentCreated>> Create(CreateBankPaymentRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await service.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(Get), new { requestId = created.RequestId }, created);
        }
        catch (ValidationException error) { return Problem(statusCode: 400, title: error.Message); }
        catch (BankTransportException error) { return Problem(statusCode: 502, title: error.Message); }
    }

    [HttpGet("payments/{requestId:guid}")]
    public ActionResult<BankPaymentDetails> Get(Guid requestId) => service.Get(requestId) is { } details ? Ok(details) : NotFound();

    [HttpPost("callbacks")]
    [RequestSizeLimit(16384)]
    public ActionResult<BankAcknowledgement> Callback(BankCallback callback)
    {
        // A shared key is ONLY our sandbox authentication, not a real bank signature scheme.
        var key = options.Value.CallbackKey;
        if (string.IsNullOrWhiteSpace(key) || key.Length < 32)
            return Problem(statusCode: 503, title: "Set BankIntegration:CallbackKey (at least 32 characters) before receiving callbacks.");
        var supplied = Request.Headers["X-Bank-Callback-Key"].ToString();
        if (string.IsNullOrEmpty(supplied) || !CryptographicOperations.FixedTimeEquals(
                SHA256.HashData(Encoding.UTF8.GetBytes(key)), SHA256.HashData(Encoding.UTF8.GetBytes(supplied))))
            return Unauthorized();
        try { return Ok(service.Receive(callback)); }
        catch (ValidationException error) { return Problem(statusCode: 400, title: error.Message); }
        catch (BankPaymentNotFoundException) { return NotFound(); }
        catch (BankCallbackConflictException error) { return Problem(statusCode: 409, title: error.Message); }
    }
}
