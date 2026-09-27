using System.ComponentModel.DataAnnotations;
using ERP.Application.DTOs;
using ERP.Application.Interfaces;
using ERP.Application.Services;
using ERP.Domain.Entities;

namespace ERP.Application.Tests;

public sealed class CustomerServiceTests
{
    private readonly CustomerMemoryRepository repository = new();
    private readonly MemoryUnitOfWork unitOfWork = new();
    private CustomerService Service => new(repository, unitOfWork);
    private static SaveCustomerRequest Request(string code = " cus-001 ") => new()
    {
        Code = code, Name = " ลูกค้าทดสอบ ", Address = " 99 กรุงเทพฯ 10000 ",
        Phone = "0812345678", Email = "", ContactName = " ผู้ติดต่อ ", Notes = "ส่งวันทำการ"
    };

    [Fact]
    public async Task CreatesCustomerWithNormalizedCodeAndContactDetails()
    {
        var result = await Service.SaveAsync(null, Request(), default);
        Assert.NotNull(result);
        Assert.Equal("CUS-001", result.Code);
        Assert.Equal("99 กรุงเทพฯ 10000", result.Address);
        Assert.Equal("ผู้ติดต่อ", result.ContactName);
        Assert.Null(result.Email);
        Assert.True(result.IsActive);
        Assert.Equal(1, unitOfWork.SaveCount);
    }

    [Fact]
    public async Task RejectsDuplicateCodeAndKeepsExistingRecord()
    {
        await Service.SaveAsync(null, Request(), default);
        await Assert.ThrowsAsync<CustomerConflictException>(() => Service.SaveAsync(null, Request("CUS-001"), default));
        Assert.Single(repository.Items);
        Assert.Equal(1, unitOfWork.SaveCount);
    }

    [Theory]
    [InlineData(" ", "name", "address", null, null)]
    [InlineData("CUS-001", " ", "address", null, null)]
    [InlineData("CUS-001", "name", " ", null, null)]
    [InlineData("CUS-001", "name", "address", "bad-email", null)]
    [InlineData("CUS-001", "name", "address", null, "123")]
    public async Task RejectsInvalidInputBeforeSaving(string code, string name, string address, string? email, string? taxId)
    {
        var request = new SaveCustomerRequest { Code = code, Name = name, Address = address, Email = email, TaxId = taxId };
        await Assert.ThrowsAsync<ValidationException>(() => Service.SaveAsync(null, request, default));
        Assert.Empty(repository.Items);
        Assert.Equal(0, unitOfWork.SaveCount);
    }

    [Fact]
    public async Task RequiresLatestVersionAndSupportsDeactivationWithoutDeletion()
    {
        var created = (await Service.SaveAsync(null, Request(), default))!;
        repository.Items[0].RowVersion = [0, 0, 0, 0, 0, 0, 0, 1];
        var request = Request();
        request.IsActive = false;
        await Assert.ThrowsAsync<ValidationException>(() => Service.SaveAsync(created.Id, request, default));
        request.RowVersion = Convert.ToBase64String(new byte[8]);
        await Assert.ThrowsAsync<CustomerConflictException>(() => Service.SaveAsync(created.Id, request, default));
        Assert.True(repository.Items[0].IsActive);
        request.RowVersion = Convert.ToBase64String(repository.Items[0].RowVersion);
        var updated = await Service.SaveAsync(created.Id, request, default);
        Assert.NotNull(updated);
        Assert.False(updated.IsActive);
        Assert.NotNull(updated.UpdatedAtUtc);
        Assert.Single(repository.Items);
        Assert.Equal(2, unitOfWork.SaveCount);
    }

    [Fact]
    public async Task DoesNotInsertWhenUpdatingMissingCustomer()
    {
        Assert.Null(await Service.SaveAsync(Guid.NewGuid(), Request(), default));
        Assert.Empty(repository.Items);
        Assert.Equal(0, unitOfWork.SaveCount);
    }

    [Theory]
    [InlineData("0812345678")]
    [InlineData("091-234-5678")]
    [InlineData("061 234 5678")]
    [InlineData("02-123-4567")]
    [InlineData("053123456")]
    [InlineData("+66 81 234 5678")]
    [InlineData("+66 2 123 4567")]
    [InlineData("")]
    [InlineData("   ")]
    public async Task AcceptsSupportedPhoneFormats(string phone)
    {
        var request = Request(); request.Phone = phone;
        Assert.NotNull(await Service.SaveAsync(null, request, default));
    }

    [Theory]
    [InlineData("0000000000")]
    [InlineData("081234567")]
    [InlineData("08123456789")]
    [InlineData("+660812345678")]
    [InlineData("abc0812345678")]
    [InlineData("0812345678 ext 1")]
    [InlineData("081\n2345678")]
    [InlineData("+1 202 555 0100")]
    public async Task RejectsInvalidPhoneBeforeSaving(string phone)
    {
        var request = Request(); request.Phone = phone;
        await Assert.ThrowsAsync<ValidationException>(() => Service.SaveAsync(null, request, default));
        Assert.Equal(0, unitOfWork.SaveCount);
    }

    [Theory]
    [InlineData("demo@example.com")]
    [InlineData("first.last+orders@example.co.th")]
    [InlineData(" demo@example.com ")]
    [InlineData("")]
    [InlineData("   ")]
    public async Task AcceptsSupportedEmailFormats(string email)
    {
        var request = Request(); request.Email = email;
        Assert.NotNull(await Service.SaveAsync(null, request, default));
    }

    [Theory]
    [InlineData("demo")]
    [InlineData("demo@localhost")]
    [InlineData("demo@@example.com")]
    [InlineData("demo @example.com")]
    [InlineData(".demo@example.com")]
    [InlineData("demo..test@example.com")]
    [InlineData("demo@-example.com")]
    [InlineData("demo@example..com")]
    public async Task RejectsMalformedEmailBeforeSaving(string email)
    {
        var request = Request(); request.Email = email;
        await Assert.ThrowsAsync<ValidationException>(() => Service.SaveAsync(null, request, default));
        Assert.Equal(0, unitOfWork.SaveCount);
    }

    [Fact]
    public async Task ValidatesCodeAndTextLengthBeforeSaving()
    {
        var request = Request("CUS 001");
        await Assert.ThrowsAsync<ValidationException>(() => Service.SaveAsync(null, request, default));
        request.Code = "CUS-001"; request.Notes = new string('a', 1001);
        await Assert.ThrowsAsync<ValidationException>(() => Service.SaveAsync(null, request, default));
        request.Notes = ""; request.Email = new string('a', 65) + "@example.com";
        await Assert.ThrowsAsync<ValidationException>(() => Service.SaveAsync(null, request, default));
        Assert.Equal(0, unitOfWork.SaveCount);
    }

    private sealed class CustomerMemoryRepository : ICustomerRepository
    {
        public List<Customer> Items { get; } = [];
        public Task<Customer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => Task.FromResult(Items.Find(c => c.Id == id));
        public Task AddAsync(Customer entity, CancellationToken cancellationToken = default) { Items.Add(entity); return Task.CompletedTask; }
        public Task<bool> CodeExistsAsync(string code, Guid? exceptId, CancellationToken cancellationToken = default) => Task.FromResult(Items.Any(c => c.Code == code && c.Id != exceptId));
        public Task<IReadOnlyList<Customer>> ListAsync(int page, int pageSize, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<(IReadOnlyList<Customer> Items, int Total)> SearchAsync(string? search, bool? isActive, int page, int pageSize, CancellationToken cancellationToken = default) => throw new NotSupportedException();
    }

    private sealed class MemoryUnitOfWork : IUnitOfWork
    {
        public int SaveCount { get; private set; }
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) { SaveCount++; return Task.FromResult(1); }
        public Task ExecuteInTransactionAsync(Func<CancellationToken, Task> operation, CancellationToken cancellationToken = default) => throw new NotSupportedException();
    }
}
