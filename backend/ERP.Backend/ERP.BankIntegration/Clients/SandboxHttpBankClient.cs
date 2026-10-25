using System.Net.Http.Json;
using System.Text.Json;
using ERP.BankIntegration.Contracts;

namespace ERP.BankIntegration.Clients;

// Use only with a test server implementing our documented contract.
// A real bank needs its own IBankClient adapter and authentication/signature rules.
public sealed class SandboxHttpBankClient(HttpClient httpClient) : IBankClient
{
    public async Task<BankPaymentResponse> CreatePaymentAsync(BankPaymentCommand request, CancellationToken cancellationToken)
    {
        try
        {
            using var response = await httpClient.PostAsJsonAsync("payments", request, cancellationToken);
            if (!response.IsSuccessStatusCode) throw new BankTransportException("Sandbox bank rejected the request.");
            var payment = await response.Content.ReadFromJsonAsync<BankPaymentResponse>(cancellationToken);
            if (payment is null || string.IsNullOrWhiteSpace(payment.BankReference) || payment.BankReference.Length > 100
                || payment.Status is not ("Pending" or "Paid" or "Failed" or "Cancelled"))
                throw new BankTransportException("Sandbox bank returned an invalid response.");
            return payment;
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        { throw new BankTransportException("Sandbox bank timed out; the remote result is unknown. Do not automatically retry."); }
        catch (HttpRequestException)
        { throw new BankTransportException("Cannot reach sandbox bank; the remote result may be unknown."); }
        catch (JsonException) { throw new BankTransportException("Sandbox bank returned invalid JSON."); }
        catch (NotSupportedException) { throw new BankTransportException("Sandbox bank returned an unsupported response."); }
    }
}

public sealed class BankTransportException(string message) : Exception(message);
