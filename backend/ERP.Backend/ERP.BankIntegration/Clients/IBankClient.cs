using ERP.BankIntegration.Contracts;

namespace ERP.BankIntegration.Clients;

public interface IBankClient
{
    Task<BankPaymentResponse> CreatePaymentAsync(BankPaymentCommand request, CancellationToken cancellationToken);
}
