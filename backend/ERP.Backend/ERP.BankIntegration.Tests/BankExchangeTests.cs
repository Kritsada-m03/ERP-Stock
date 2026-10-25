using System.ComponentModel.DataAnnotations;
using ERP.BankIntegration.Clients;
using ERP.BankIntegration.Configuration;
using ERP.BankIntegration.Contracts;
using ERP.BankIntegration.Services;
using ERP.BankIntegration.Storage;
using Microsoft.Extensions.Options;

namespace ERP.BankIntegration.Tests;

public sealed class BankExchangeTests
{
    private readonly BankExchangeStore store = new();
    private BankExchangeService Service => new(new MockBankClient(), store, Options.Create(new BankIntegrationOptions()));
    private static CreateBankPaymentRequest Request(decimal amount = 125m) => new() { OrderReference = " SO-DEMO-001 ", Amount = amount };
    internal static BankCallback Callback(BankPaymentCreated payment) => new()
    {
        EventId = "event-001", RequestId = payment.RequestId, BankReference = payment.BankReference,
        Amount = payment.Amount, Currency = payment.Currency, Status = "Paid"
    };

    [Fact]
    public async Task CreatesMockRequestAndAcknowledgesCallbackWithoutChangingOriginalProviderStatus()
    {
        var payment = await Service.CreateAsync(Request(), default);
        Assert.Equal("SO-DEMO-001", payment.OrderReference);
        Assert.Equal("Mock", payment.Mode);
        Assert.StartsWith("MOCK-", payment.BankReference);
        var ack = Service.Receive(Callback(payment));
        Assert.True(ack.Received); Assert.False(ack.Duplicate);
        var saved = Service.Get(payment.RequestId)!;
        Assert.Equal("Pending", saved.Request.ProviderStatus);
        Assert.Equal("Paid", Assert.Single(saved.Callbacks).Payload.Status);
    }

    [Fact]
    public async Task RepeatedCallbackIsAcknowledgedOnceAndConflictingEventIsRejected()
    {
        var payment = await Service.CreateAsync(Request(), default);
        var callback = Callback(payment);
        Service.Receive(callback);
        var acknowledgements = await Task.WhenAll(Enumerable.Range(0, 5).Select(_ => Task.Run(() => Service.Receive(callback))));
        Assert.All(acknowledgements, ack => Assert.True(ack.Duplicate));
        Assert.Single(Service.Get(payment.RequestId)!.Callbacks);
        Assert.Throws<BankCallbackConflictException>(() => Service.Receive(callback with { Status = "Failed" }));
        Assert.Equal("Paid", Assert.Single(Service.Get(payment.RequestId)!.Callbacks).Payload.Status);
    }

    [Fact]
    public async Task RejectsUnknownOrMismatchingCallbacksBeforeRecording()
    {
        var payment = await Service.CreateAsync(Request(), default);
        var callback = Callback(payment);
        Assert.Throws<BankPaymentNotFoundException>(() => Service.Receive(callback with { RequestId = Guid.NewGuid() }));
        Assert.Throws<BankCallbackConflictException>(() => Service.Receive(callback with { BankReference = "another-payment" }));
        Assert.Throws<BankCallbackConflictException>(() => Service.Receive(callback with { Amount = 100 }));
        Assert.Throws<ValidationException>(() => Service.Receive(callback with { Currency = "USD" }));
        Assert.Throws<ValidationException>(() => Service.Receive(callback with { Status = "SomethingElse" }));
        Assert.Throws<ValidationException>(() => Service.Receive(callback with { RequestId = Guid.Empty }));
        Assert.Empty(Service.Get(payment.RequestId)!.Callbacks);
    }

    [Theory]
    [InlineData("0")]
    [InlineData("-1")]
    [InlineData("1.001")]
    [InlineData("1000000000")]
    public async Task RejectsInvalidAmounts(string text) => await Assert.ThrowsAsync<ValidationException>(
        () => Service.CreateAsync(Request(decimal.Parse(text, System.Globalization.CultureInfo.InvariantCulture)), default));

    [Fact]
    public async Task RejectsBlankOrderReferenceAndAcceptsSmallestAmount()
    {
        await Assert.ThrowsAsync<ValidationException>(() => Service.CreateAsync(Request() with { OrderReference = " " }, default));
        Assert.Equal(0.01m, (await Service.CreateAsync(Request(0.01m), default)).Amount);
    }

    [Fact]
    public async Task RecordsCallbacksAsEventsWithoutAssumingArrivalOrderIsFinalPaymentStatus()
    {
        var payment = await Service.CreateAsync(Request(), default);
        Service.Receive(Callback(payment));
        Service.Receive(Callback(payment) with { EventId = "delayed-event", Status = "Pending" });
        Assert.Equal(2, Service.Get(payment.RequestId)!.Callbacks.Count);
        Assert.Equal("Pending", Service.Get(payment.RequestId)!.Request.ProviderStatus);
    }
}
