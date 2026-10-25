using ERP.BankIntegration.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace ERP.BankIntegration.Endpoints;

public sealed class BankDevelopmentOnlyFilter(IHostEnvironment environment, IOptions<BankIntegrationOptions> options) : IAsyncResourceFilter
{
    public async Task OnResourceExecutionAsync(ResourceExecutingContext context, ResourceExecutionDelegate next)
    {
        if (!environment.IsDevelopment() || !options.Value.Enabled) { context.Result = new NotFoundResult(); return; }
        await next();
    }
}
