using ERP.Domain.Common;
using ERP.Domain.Enums;

namespace ERP.Domain.Entities;

public sealed class Delivery : Entity
{
    public required string DeliveryNo { get; set; }
    public Guid SalesOrderId { get; set; }
    public DeliveryStatus Status { get; set; } = DeliveryStatus.Preparing;
    public required string RecipientNameSnapshot { get; set; }
    public required string AddressSnapshot { get; set; }
    public string? TrackingNo { get; set; }
    public DateTime? PreparedAtUtc { get; set; }
    public DateTime? DocumentIssuedAtUtc { get; set; }
    public Guid? IssuedByUserId { get; set; }
    public DateTime? ShippedAtUtc { get; set; }
    public Guid? ShippedByUserId { get; set; }
    public DateTime? StockDeductedAtUtc { get; set; }
    public int SnapshotVersion { get; set; } = 1;
    public string? DocumentSnapshotJson { get; set; }
}

