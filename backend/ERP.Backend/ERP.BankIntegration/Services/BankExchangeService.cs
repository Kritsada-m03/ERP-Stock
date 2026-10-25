using System.ComponentModel.DataAnnotations;
using ERP.BankIntegration.Clients;
using ERP.BankIntegration.Configuration;
using ERP.BankIntegration.Contracts;
using ERP.BankIntegration.Storage;
using Microsoft.Extensions.Options;

namespace ERP.BankIntegration.Services;

public sealed class BankExchangeService(IBankClient bank, BankExchangeStore store, IOptions<BankIntegrationOptions> options)
{
    public async Task<BankPaymentCreated> CreateAsync(CreateBankPaymentRequest request, CancellationToken cancellationToken)
    {
        Validator.ValidateObject(request, new ValidationContext(request), true);
        ValidateAmount(request.Amount);
        var command = new BankPaymentCommand(Guid.NewGuid(), request.OrderReference.Trim(), request.Amount, request.Currency);
        var response = await bank.CreatePaymentAsync(command, cancellationToken);
        var created = new BankPaymentCreated(command.RequestId, command.OrderReference, command.Amount, command.Currency,
            response.BankReference, response.Status, options.Value.Mode, DateTimeOffset.UtcNow);
        store.Add(created);
        return created;
    }

    public BankPaymentDetails? Get(Guid id) => store.Get(id);

    public BankAcknowledgement Receive(BankCallback callback)
    {
        Validator.ValidateObject(callback, new ValidationContext(callback), true);
        if (callback.RequestId == Guid.Empty) throw new ValidationException("RequestId is required.");
        ValidateAmount(callback.Amount);
        return store.Receive(callback);
    }

    private static void ValidateAmount(decimal amount)
    {
        if (decimal.Round(amount, 2) != amount) throw new ValidationException("Amount must have at most two decimal places.");
    }
}
