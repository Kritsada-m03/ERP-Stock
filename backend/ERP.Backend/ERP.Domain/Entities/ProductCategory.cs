using ERP.Domain.Common;

namespace ERP.Domain.Entities;

public sealed class ProductCategory : Entity
{
    public required string Name { get; set; }
    public bool IsActive { get; set; } = true;
}

