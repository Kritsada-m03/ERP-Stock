using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Configurations;

public sealed class StockConfiguration : EntityConfiguration<Stock>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Stock> builder)
    {
        builder.ToTable("Stocks", table => table.HasCheckConstraint("CK_Stocks_Quantities",
            "[OnHandQuantity] >= 0 AND [ReservedQuantity] >= 0 AND [ReservedQuantity] <= [OnHandQuantity]"));
        builder.Property(x => x.OnHandQuantity).HasPrecision(18, 3);
        builder.Property(x => x.ReservedQuantity).HasPrecision(18, 3);
        builder.Ignore(x => x.AvailableQuantity);
        builder.HasIndex(x => new { x.ProductId, x.WarehouseId }).IsUnique();
        builder.HasOne<Product>().WithMany().HasForeignKey(x => x.ProductId);
        builder.HasOne<Warehouse>().WithMany().HasForeignKey(x => x.WarehouseId);
    }
}

