using ERP.Domain.Entities;

namespace ERP.Application.Interfaces;

public interface ISalesOrderRepository : IRepository<SalesOrder>
{
    Task<SalesOrder?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default);
}

