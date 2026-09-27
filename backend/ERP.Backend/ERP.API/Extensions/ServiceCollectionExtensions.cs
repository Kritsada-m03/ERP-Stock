using ERP.Application.Interfaces;
using ERP.Application.Services;
using ERP.Infrastructure.Services;

namespace ERP.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddErpServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICustomerService, CustomerService>();
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is required.");
        return services.AddInfrastructure(connectionString);
    }
}

