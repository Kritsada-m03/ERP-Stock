using ERP.Domain.Common;

namespace ERP.Domain.Entities;

public sealed class Warehouse : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public bool IsActive { get; set; } = true;
}

