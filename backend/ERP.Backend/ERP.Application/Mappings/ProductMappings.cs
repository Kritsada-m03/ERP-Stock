using ERP.Application.DTOs;
using ERP.Domain.Entities;

namespace ERP.Application.Mappings;

public static class ProductMappings
{
    public static ProductDto ToDto(this Product product) =>
        new(product.Id, product.Sku, product.Name, product.UnitName, product.SalePrice, product.IsActive);
}

