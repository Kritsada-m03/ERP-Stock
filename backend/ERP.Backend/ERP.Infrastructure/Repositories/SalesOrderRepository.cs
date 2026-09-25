using ERP.Application.Interfaces;
using ERP.Domain.Entities;
using ERP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERP.Infrastructure.Repositories;

public sealed class SalesOrderRepository(ErpDbContext context) : Repository<SalesOrder>(context), ISalesOrderRepository
{
    public Task<SalesOrder?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default) =>
        Context.SalesOrders.Include(order => order.Items).SingleOrDefaultAsync(order => order.Id == id, cancellationToken);
}

