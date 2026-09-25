namespace ERP.Application.DTOs;

public sealed record ProductDto(Guid Id, string Sku, string Name, string UnitName, decimal SalePrice, bool IsActive);

