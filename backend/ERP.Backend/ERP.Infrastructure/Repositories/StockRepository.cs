using ERP.Application.Interfaces;
using ERP.Domain.Entities;
using ERP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERP.Infrastructure.Repositories;

public sealed class StockRepository(ErpDbContext context) : Repository<Stock>(context), IStockRepository
{
    public Task<Stock?> GetByProductAsync(Guid productId, Guid warehouseId, CancellationToken cancellationToken = default) =>
        Context.Stocks.SingleOrDefaultAsync(stock => stock.ProductId == productId && stock.WarehouseId == warehouseId, cancellationToken);
}

