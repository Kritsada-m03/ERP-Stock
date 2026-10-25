using System.ComponentModel.DataAnnotations;

namespace ERP.BankIntegration.Contracts;

// This is our sandbox contract, NOT a bank's official API schema.
public sealed record CreateBankPaymentRequest
{
    [Required, StringLength(100)] public string OrderReference { get; init; } = "";
    [Range(typeof(decimal), "0.01", "999999999.99")] public decimal Amount { get; init; }
    [Required, RegularExpression("^THB$")] public string Currency { get; init; } = "THB";
}

public sealed record BankPaymentCommand(Guid RequestId, string OrderReference, decimal Amount, string Currency);
public sealed record BankPaymentResponse(string BankReference, string Status);
public sealed record BankPaymentCreated(Guid RequestId, string OrderReference, decimal Amount, string Currency,
    string BankReference, string ProviderStatus, string Mode, DateTimeOffset CreatedAtUtc);

public sealed record BankCallback
{
    [Required, StringLength(100)] public string EventId { get; init; } = "";
    public Guid RequestId { get; init; }
    [Required, StringLength(100)] public string BankReference { get; init; } = "";
    [Required, RegularExpression("^(Pending|Paid|Failed|Cancelled)$")] public string Status { get; init; } = "";
    [Range(typeof(decimal), "0.01", "999999999.99")] public decimal Amount { get; init; }
    [Required, RegularExpression("^THB$")] public string Currency { get; init; } = "THB";
}

public sealed record BankCallbackReceipt(BankCallback Payload, DateTimeOffset ReceivedAtUtc);
public sealed record BankAcknowledgement(string EventId, bool Received, bool Duplicate);
public sealed record BankPaymentDetails(BankPaymentCreated Request, IReadOnlyList<BankCallbackReceipt> Callbacks);
