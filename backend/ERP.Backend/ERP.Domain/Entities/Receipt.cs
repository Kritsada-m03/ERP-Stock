using ERP.Domain.Common;

namespace ERP.Domain.Entities;

public sealed class Receipt : Entity
{
    public required string ReceiptNo { get; set; }
    public Guid SalesOrderId { get; set; }
    public Guid PaymentId { get; set; }
    public Guid IssuedByUserId { get; set; }
    public DateOnly IssuedDate { get; set; }
    public DateTime IssuedAtUtc { get; set; }
    public decimal TotalAmount { get; set; }
    public int SnapshotVersion { get; set; } = 1;
    public required string DocumentSnapshotJson { get; set; }
}

