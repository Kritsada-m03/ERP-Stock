using System.ComponentModel.DataAnnotations;
using ERP.Application.DTOs;
using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Application.Services;

public sealed class CustomerService(ICustomerRepository customers, IUnitOfWork unitOfWork) : ICustomerService
{
    public async Task<CustomerPage> SearchAsync(string? search, bool? isActive, int page, int pageSize, CancellationToken cancellationToken)
    {
        var result = await customers.SearchAsync(search, isActive, page, pageSize, cancellationToken);
        return new(result.Items.Select(ToDto).ToArray(), result.Total, page, pageSize);
    }

    public async Task<CustomerDto?> GetAsync(Guid id, CancellationToken cancellationToken) =>
        await customers.GetByIdAsync(id, cancellationToken) is { } customer ? ToDto(customer) : null;

    public async Task<CustomerDto?> SaveAsync(Guid? id, SaveCustomerRequest request, CancellationToken cancellationToken)
    {
        Validator.ValidateObject(request, new ValidationContext(request), validateAllProperties: true);
        var code = request.Code.Trim().ToUpperInvariant();
        if (await customers.CodeExistsAsync(code, id, cancellationToken))
            throw new CustomerConflictException("รหัสลูกค้านี้มีอยู่แล้ว");
        var customer = id.HasValue ? await customers.GetByIdAsync(id.Value, cancellationToken) : new Customer { Code = code, Name = request.Name.Trim() };
        if (customer is null) return null;
        if (id.HasValue)
        {
            if (string.IsNullOrWhiteSpace(request.RowVersion)) throw new ValidationException("กรุณาระบุ RowVersion จากข้อมูลล่าสุด");
            if (request.RowVersion != Convert.ToBase64String(customer.RowVersion))
                throw new CustomerConflictException("ข้อมูลถูกแก้ไขแล้ว กรุณาโหลดข้อมูลล่าสุดก่อนบันทึก");
            customer.UpdatedAtUtc = DateTime.UtcNow;
        }
        customer.Code = code;
        customer.Name = request.Name.Trim();
        customer.ContactName = Clean(request.ContactName);
        customer.Phone = Clean(request.Phone);
        customer.Email = Clean(request.Email);
        customer.Address = request.Address.Trim();
        customer.TaxId = Clean(request.TaxId);
        customer.Notes = Clean(request.Notes);
        customer.IsActive = request.IsActive;
        if (!id.HasValue) await customers.AddAsync(customer, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToDto(customer);
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static CustomerDto ToDto(Customer c) => new(c.Id, c.Code, c.Name, c.ContactName, c.Phone,
        c.Email, c.Address, c.TaxId, c.Notes, c.IsActive, c.CreatedAtUtc, c.UpdatedAtUtc, Convert.ToBase64String(c.RowVersion));
}

public sealed class CustomerConflictException(string message) : Exception(message);
