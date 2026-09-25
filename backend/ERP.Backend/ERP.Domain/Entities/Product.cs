using ERP.Domain.Common;

namespace ERP.Domain.Entities;

public sealed class Product : Entity
{
    public required string Sku { get; set; }
    public required string Name { get; set; }
    public string? Barcode { get; set; }
    public Guid ProductCategoryId { get; set; }
    public required string UnitName { get; set; }
    public decimal SalePrice { get; set; }
    public decimal ReorderPoint { get; set; }
    public bool IsActive { get; set; } = true;
}

