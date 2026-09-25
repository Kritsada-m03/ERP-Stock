using ERP.Domain.Common;

namespace ERP.Domain.Entities;

public sealed class SalesOrderItem : Entity
{
    public Guid SalesOrderId { get; set; }
    public Guid ProductId { get; set; }
    public int LineNo { get; set; }
    public required string SkuSnapshot { get; set; }
    public required string ProductNameSnapshot { get; set; }
    public required string UnitNameSnapshot { get; set; }
    public decimal Quantity { get; set; }
    public decimal ReservedQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal LineTotal { get; set; }
}

