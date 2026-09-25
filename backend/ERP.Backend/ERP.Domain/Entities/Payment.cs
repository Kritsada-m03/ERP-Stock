using ERP.Domain.Common;
using ERP.Domain.Enums;
using ERP.Domain.Constants;

namespace ERP.Domain.Entities;

public sealed class Payment : Entity
{
    public Guid SalesOrderId { get; set; }
    public required string PaymentNo { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = Currencies.ThaiBaht;
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? QrPayload { get; set; }
    public string? RecipientSnapshot { get; set; }
    public string? ProviderReference { get; set; }
    public string? BankTransactionReference { get; set; }
    public string? EvidenceStorageKey { get; set; }
    public DateTime? ExpiresAtUtc { get; set; }
    public DateTime? VerifiedAtUtc { get; set; }
    public Guid? VerifiedByUserId { get; set; }
}

