using ERP.Application.Interfaces;

namespace ERP.Infrastructure.Data;

public sealed class UnitOfWork(ErpDbContext context) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        context.SaveChangesAsync(cancellationToken);

    public async Task ExecuteInTransactionAsync(Func<CancellationToken, Task> operation, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(operation);
        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await operation(cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            context.ChangeTracker.Clear();
            throw; // Disposing the uncommitted transaction rolls it back.
        }
    }
}

