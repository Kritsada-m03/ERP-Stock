using ERP.Domain.Common;

namespace ERP.Domain.Entities;

public sealed class Stock : Entity
{
    public Guid ProductId { get; set; }
    public Guid WarehouseId { get; set; }
    public decimal OnHandQuantity { get; set; }
    public decimal ReservedQuantity { get; set; }
    public decimal AvailableQuantity => OnHandQuantity - ReservedQuantity;
}

