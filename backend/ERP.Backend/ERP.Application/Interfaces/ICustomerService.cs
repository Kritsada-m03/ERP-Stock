using ERP.Application.DTOs;

namespace ERP.Application.Interfaces;

public interface ICustomerService
{
    Task<CustomerPage> SearchAsync(string? search, bool? isActive, int page, int pageSize, CancellationToken cancellationToken);
    Task<CustomerDto?> GetAsync(Guid id, CancellationToken cancellationToken);
    Task<CustomerDto?> SaveAsync(Guid? id, SaveCustomerRequest request, CancellationToken cancellationToken);
}
