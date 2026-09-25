using ERP.Domain.Common;

namespace ERP.Domain.Entities;

public sealed class User : Entity
{
    public required string UserName { get; set; }
    public required string DisplayName { get; set; }
    public string? Email { get; set; }
    public bool IsActive { get; set; } = true;
}

