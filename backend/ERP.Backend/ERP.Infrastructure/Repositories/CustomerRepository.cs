using ERP.Application.Interfaces;
using ERP.Domain.Entities;
using ERP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERP.Infrastructure.Repositories;

public sealed class CustomerRepository(ErpDbContext context) : Repository<Customer>(context), ICustomerRepository
{
    public Task<bool> CodeExistsAsync(string code, Guid? exceptId, CancellationToken cancellationToken = default) =>
        Context.Customers.AnyAsync(c => c.Code == code && (!exceptId.HasValue || c.Id != exceptId.Value), cancellationToken);

    public async Task<(IReadOnlyList<Customer> Items, int Total)> SearchAsync(string? search, bool? isActive,
        int page, int pageSize, CancellationToken cancellationToken = default)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(page, 1);
        ArgumentOutOfRangeException.ThrowIfLessThan(pageSize, 1);
        ArgumentOutOfRangeException.ThrowIfGreaterThan(pageSize, 100);
        var query = Context.Customers.AsNoTracking();
        if (isActive.HasValue) query = query.Where(c => c.IsActive == isActive.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(c => c.Code.Contains(term) || c.Name.Contains(term)
                || (c.Phone != null && c.Phone.Contains(term)) || (c.Email != null && c.Email.Contains(term)));
        }
        var total = await query.CountAsync(cancellationToken);
        var items = await query.OrderBy(c => c.Code).ThenBy(c => c.Id)
            .Skip(checked((page - 1) * pageSize)).Take(pageSize).ToListAsync(cancellationToken);
        return (items, total);
    }
}
