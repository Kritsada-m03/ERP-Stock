using ERP.Domain.Entities;

namespace ERP.Application.Interfaces;

public interface IStockRepository : IRepository<Stock>
{
    Task<Stock?> GetByProductAsync(Guid productId, Guid warehouseId, CancellationToken cancellationToken = default);
}

