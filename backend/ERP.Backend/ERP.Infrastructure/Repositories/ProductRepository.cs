using ERP.Application.Interfaces;
using ERP.Domain.Entities;
using ERP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERP.Infrastructure.Repositories;

public sealed class ProductRepository(ErpDbContext context) : Repository<Product>(context), IProductRepository
{
    public Task<Product?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default) =>
        Context.Products.SingleOrDefaultAsync(product => product.Sku == sku, cancellationToken);
}

