using ERP.BankIntegration.Contracts;

namespace ERP.BankIntegration.Clients;

// No network call or real QR/payment is created in Mock mode.
public sealed class MockBankClient : IBankClient
{
    public Task<BankPaymentResponse> CreatePaymentAsync(BankPaymentCommand request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return Task.FromResult(new BankPaymentResponse($"MOCK-{request.RequestId:N}", "Pending"));
    }
}
