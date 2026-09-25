using ERP.Application.DTOs;
using ERP.Application.Interfaces;
using ERP.Application.Mappings;

namespace ERP.Application.Services;

public sealed class ProductService(IProductRepository products) : IProductService
{
    public async Task<ProductDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        (await products.GetByIdAsync(id, cancellationToken))?.ToDto();
}

