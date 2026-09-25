using ERP.Application.Interfaces;
using ERP.Domain.Common;
using ERP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ERP.Infrastructure.Repositories;

public class Repository<TEntity>(ErpDbContext context) : IRepository<TEntity> where TEntity : Entity
{
    protected ErpDbContext Context { get; } = context;

    public async Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await Context.Set<TEntity>().FindAsync([id], cancellationToken);

    public async Task<IReadOnlyList<TEntity>> ListAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(page, 1);
        ArgumentOutOfRangeException.ThrowIfLessThan(pageSize, 1);
        ArgumentOutOfRangeException.ThrowIfGreaterThan(pageSize, 100);
        var offset = checked((page - 1) * pageSize);
        return await Context.Set<TEntity>().AsNoTracking().OrderBy(entity => entity.Id)
            .Skip(offset).Take(pageSize).ToListAsync(cancellationToken);
    }

    public async Task AddAsync(TEntity entity, CancellationToken cancellationToken = default) =>
        await Context.Set<TEntity>().AddAsync(entity, cancellationToken);
}

