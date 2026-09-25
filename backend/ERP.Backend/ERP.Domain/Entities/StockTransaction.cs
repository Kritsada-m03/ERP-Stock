using ERP.Domain.Common;
using ERP.Domain.Enums;

namespace ERP.Domain.Entities;

public sealed class StockTransaction : Entity
{
    public Guid StockId { get; set; }
    public Guid? SalesOrderId { get; set; }
    public Guid? DeliveryId { get; set; }
    public Guid PerformedByUserId { get; set; }
    public StockTransactionType Type { get; set; }
    public decimal QuantityDelta { get; set; }
    public required string Reason { get; set; }
    public required string OperationKey { get; set; }
}

