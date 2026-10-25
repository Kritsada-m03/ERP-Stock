using ERP.BankIntegration.Contracts;

namespace ERP.BankIntegration.Storage;

// Development-only, single-process storage. Deliberately independent of ERP tables.
public sealed class BankExchangeStore
{
    private readonly object gate = new();
    private readonly Dictionary<Guid, BankPaymentCreated> payments = [];
    private readonly Dictionary<string, BankCallbackReceipt> events = new(StringComparer.Ordinal);

    public void Add(BankPaymentCreated payment) { lock (gate) payments.Add(payment.RequestId, payment); }

    public BankPaymentDetails? Get(Guid requestId)
    {
        lock (gate)
            return payments.TryGetValue(requestId, out var payment)
                ? new(payment, events.Values.Where(e => e.Payload.RequestId == requestId).OrderBy(e => e.ReceivedAtUtc).ToArray())
                : null;
    }

    public BankAcknowledgement Receive(BankCallback callback)
    {
        lock (gate)
        {
            if (events.TryGetValue(callback.EventId, out var existing))
            {
                if (existing.Payload != callback) throw new BankCallbackConflictException("EventId was reused with different data.");
                return new(callback.EventId, true, true);
            }
            if (!payments.TryGetValue(callback.RequestId, out var payment)) throw new BankPaymentNotFoundException();
            if (callback.BankReference != payment.BankReference || callback.Amount != payment.Amount || callback.Currency != payment.Currency)
                throw new BankCallbackConflictException("Callback does not match the payment reference, amount or currency.");
            events.Add(callback.EventId, new(callback, DateTimeOffset.UtcNow));
            return new(callback.EventId, true, false);
        }
    }
}

public sealed class BankCallbackConflictException(string message) : Exception(message);
public sealed class BankPaymentNotFoundException : Exception;
