using ERP.BankIntegration.Clients;
using ERP.BankIntegration.Configuration;
using ERP.BankIntegration.Contracts;
using ERP.BankIntegration.Endpoints;
using ERP.BankIntegration.Services;
using ERP.BankIntegration.Storage;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace ERP.BankIntegration.Tests;

public sealed class BankPaymentsControllerTests
{
    private const string Key = "unit-test-only-callback-key-1234567890";

    [Theory]
    [InlineData(null, 401)]
    [InlineData("wrong-key", 401)]
    [InlineData(Key, 200)]
    public async Task RequiresCallbackKeyBeforeRecording(string? supplied, int status)
    {
        var options = Options.Create(new BankIntegrationOptions { CallbackKey = Key });
        var service = new BankExchangeService(new MockBankClient(), new BankExchangeStore(), options);
        var payment = await service.CreateAsync(new CreateBankPaymentRequest { OrderReference = "SO-001", Amount = 10 }, default);
        var controller = new BankPaymentsController(service, options) { ControllerContext = new() { HttpContext = new DefaultHttpContext() } };
        if (supplied is not null) controller.Request.Headers["X-Bank-Callback-Key"] = supplied;
        var result = controller.Callback(BankExchangeTests.Callback(payment)).Result;
        if (status == 200) Assert.IsType<OkObjectResult>(result);
        else Assert.IsType<UnauthorizedResult>(result);
        Assert.Equal(status == 200 ? 1 : 0, service.Get(payment.RequestId)!.Callbacks.Count);
    }

    [Fact]
    public void MissingServerKeyDoesNotAcceptCallback()
    {
        var options = Options.Create(new BankIntegrationOptions());
        var service = new BankExchangeService(new MockBankClient(), new BankExchangeStore(), options);
        var controller = new BankPaymentsController(service, options) { ControllerContext = new() { HttpContext = new DefaultHttpContext() } };
        var result = Assert.IsType<ObjectResult>(controller.Callback(new BankCallback()).Result);
        Assert.Equal(503, result.StatusCode);
    }
}
