using ERP.Domain.Entities;

namespace ERP.Application.Interfaces;

public interface ICustomerRepository : IRepository<Customer>
{
    Task<(IReadOnlyList<Customer> Items, int Total)> SearchAsync(string? search, bool? isActive,
        int page, int pageSize, CancellationToken cancellationToken = default);
    Task<bool> CodeExistsAsync(string code, Guid? exceptId, CancellationToken cancellationToken = default);
}
