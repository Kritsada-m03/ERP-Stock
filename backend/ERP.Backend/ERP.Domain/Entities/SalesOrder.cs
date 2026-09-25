using ERP.Domain.Common;
using ERP.Domain.Enums;

namespace ERP.Domain.Entities;

public sealed class SalesOrder : Entity
{
    public required string OrderNo { get; set; }
    public Guid CustomerId { get; set; }
    public Guid WarehouseId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateOnly OrderDate { get; set; }
    public SalesOrderStatus Status { get; set; } = SalesOrderStatus.Draft;
    public required string CustomerNameSnapshot { get; set; }
    public required string DeliveryAddressSnapshot { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime? ConfirmedAtUtc { get; set; }
    public ICollection<SalesOrderItem> Items { get; set; } = new List<SalesOrderItem>();
}

