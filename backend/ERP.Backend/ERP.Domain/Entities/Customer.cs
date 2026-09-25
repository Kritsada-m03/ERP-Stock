using ERP.Domain.Common;

namespace ERP.Domain.Entities;

public sealed class Customer : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;
}

