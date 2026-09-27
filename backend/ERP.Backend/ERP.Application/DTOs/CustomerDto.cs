using ERP.Application.Validators;

namespace ERP.Application.DTOs;

public sealed record CustomerDto(Guid Id, string Code, string Name, string? ContactName,
    string? Phone, string? Email, string? Address, string? TaxId, string? Notes,
    bool IsActive, DateTime CreatedAtUtc, DateTime? UpdatedAtUtc, string RowVersion);

public sealed class SaveCustomerRequest
{
    [CustomerField("code")] public string Code { get; set; } = "";
    [CustomerField("name")] public string Name { get; set; } = "";
    [CustomerField("contactName")] public string? ContactName { get; set; }
    [CustomerField("phone")] public string? Phone { get; set; }
    [CustomerField("email")] public string? Email { get; set; }
    [CustomerField("address")] public string Address { get; set; } = "";
    [CustomerField("taxId")] public string? TaxId { get; set; }
    [CustomerField("notes")] public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    public string? RowVersion { get; set; }
}

public sealed record CustomerPage(IReadOnlyList<CustomerDto> Items, int Total, int Page, int PageSize);
