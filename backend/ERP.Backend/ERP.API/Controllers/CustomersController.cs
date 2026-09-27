using System.ComponentModel.DataAnnotations;
using ERP.Application.DTOs;
using ERP.Application.Interfaces;
using ERP.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace ERP.API.Controllers;

[ApiController]
[Route("api/customers")]
public sealed class CustomersController(ICustomerService customers) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<CustomerPage>> Search([FromQuery, StringLength(200)] string? search,
        [FromQuery] bool? isActive, CancellationToken cancellationToken,
        [FromQuery, Range(1, 1000000)] int page = 1, [FromQuery, Range(1, 100)] int pageSize = 20) =>
        Ok(await customers.SearchAsync(search, isActive, page, pageSize, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CustomerDto>> Get(Guid id, CancellationToken cancellationToken) =>
        await customers.GetAsync(id, cancellationToken) is { } customer ? Ok(customer) : NotFound();

    [HttpPost]
    public Task<ActionResult<CustomerDto>> Create(SaveCustomerRequest request, CancellationToken cancellationToken) =>
        Save(null, request, cancellationToken);

    [HttpPut("{id:guid}")]
    public Task<ActionResult<CustomerDto>> Update(Guid id, SaveCustomerRequest request, CancellationToken cancellationToken) =>
        Save(id, request, cancellationToken);

    private async Task<ActionResult<CustomerDto>> Save(Guid? id, SaveCustomerRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var customer = await customers.SaveAsync(id, request, cancellationToken);
            if (customer is null) return NotFound();
            return id.HasValue ? Ok(customer) : CreatedAtAction(nameof(Get), new { id = customer.Id }, customer);
        }
        catch (ValidationException error) { return Problem(statusCode: 400, title: error.Message); }
        catch (CustomerConflictException error) { return Problem(statusCode: 409, title: error.Message); }
        catch (DbUpdateConcurrencyException) { return Problem(statusCode: 409, title: "ข้อมูลถูกแก้ไขแล้ว กรุณาโหลดใหม่"); }
        catch (DbUpdateException error) when (error.InnerException is SqlException { Number: 2601 or 2627 })
        { return Problem(statusCode: 409, title: "รหัสลูกค้านี้มีอยู่แล้ว"); }
    }
}
