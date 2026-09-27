using ERP.Application.Interfaces;
using ERP.Infrastructure.Data;
using ERP.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ERP.Infrastructure.Services;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<ErpDbContext>(options => options.UseSqlServer(connectionString));
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<ISalesOrderRepository, SalesOrderRepository>();
        services.AddScoped<IStockRepository, StockRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        return services;
    }
}

