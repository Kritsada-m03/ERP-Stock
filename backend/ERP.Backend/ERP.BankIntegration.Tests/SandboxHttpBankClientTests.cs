using System.Net;
using System.Net.Http.Json;
using ERP.BankIntegration.Clients;
using ERP.BankIntegration.Contracts;

namespace ERP.BankIntegration.Tests;

public sealed class SandboxHttpBankClientTests
{
    private static BankPaymentCommand Command => new(Guid.NewGuid(), "SO-TEST", 125m, "THB");

    [Fact]
    public async Task SendsJsonRequestAndReadsBankResponse()
    {
        var command = Command;
        using var handler = new StubHandler(async request =>
        {
            Assert.Equal(HttpMethod.Post, request.Method);
            Assert.Equal("https://sandbox.example.test/v1/payments", request.RequestUri!.AbsoluteUri);
            Assert.Equal(command, await request.Content!.ReadFromJsonAsync<BankPaymentCommand>());
            return new(HttpStatusCode.Created) { Content = JsonContent.Create(new BankPaymentResponse("BANK-001", "Pending")) };
        });
        using var http = new HttpClient(handler) { BaseAddress = new Uri("https://sandbox.example.test/v1/") };
        var result = await new SandboxHttpBankClient(http).CreatePaymentAsync(command, default);
        Assert.Equal("BANK-001", result.BankReference);
        Assert.Equal(1, handler.Calls);
    }

    [Theory]
    [InlineData(400)]
    [InlineData(401)]
    [InlineData(429)]
    [InlineData(500)]
    public async Task RejectsHttpErrorsWithoutRetryOrExposingRemoteBody(int status)
    {
        using var handler = new StubHandler(_ => Task.FromResult(new HttpResponseMessage((HttpStatusCode)status) { Content = new StringContent("private bank diagnostics") }));
        using var http = new HttpClient(handler) { BaseAddress = new Uri("https://sandbox.example.test/") };
        var error = await Assert.ThrowsAsync<BankTransportException>(() => new SandboxHttpBankClient(http).CreatePaymentAsync(Command, default));
        Assert.DoesNotContain("private", error.Message);
        Assert.Equal(1, handler.Calls);
    }

    [Theory]
    [InlineData("not-json")]
    [InlineData("null")]
    [InlineData("{\"bankReference\":\"\",\"status\":\"Pending\"}")]
    [InlineData("{\"bankReference\":\"B1\",\"status\":\"Unexpected\"}")]
    public async Task RejectsMalformedBankResponse(string body)
    {
        using var handler = new StubHandler(_ => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
        { Content = new StringContent(body, System.Text.Encoding.UTF8, "application/json") }));
        using var http = new HttpClient(handler) { BaseAddress = new Uri("https://sandbox.example.test/") };
        await Assert.ThrowsAsync<BankTransportException>(() => new SandboxHttpBankClient(http).CreatePaymentAsync(Command, default));
    }

    [Fact]
    public async Task ReportsTimeoutWithoutRetry()
    {
        using var handler = new StubHandler(_ => throw new TaskCanceledException());
        using var http = new HttpClient(handler) { BaseAddress = new Uri("https://sandbox.example.test/") };
        var error = await Assert.ThrowsAsync<BankTransportException>(() => new SandboxHttpBankClient(http).CreatePaymentAsync(Command, default));
        Assert.Contains("unknown", error.Message);
        Assert.Equal(1, handler.Calls);
    }

    private sealed class StubHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> send) : HttpMessageHandler
    {
        public int Calls { get; private set; }
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        { Calls++; return send(request); }
    }
}
