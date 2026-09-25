using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Configurations;

public sealed class ProductConfiguration : EntityConfiguration<Product>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products", table => {
            table.HasCheckConstraint("CK_Products_SalePrice", "[SalePrice] >= 0");
            table.HasCheckConstraint("CK_Products_ReorderPoint", "[ReorderPoint] >= 0");
        });
        builder.Property(x => x.Sku).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Sku).IsUnique();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Barcode).HasMaxLength(100);
        builder.Property(x => x.UnitName).HasMaxLength(50).IsRequired();
        builder.Property(x => x.SalePrice).HasPrecision(18, 2);
        builder.Property(x => x.ReorderPoint).HasPrecision(18, 3);
        builder.HasOne<ProductCategory>().WithMany().HasForeignKey(x => x.ProductCategoryId);
    }
}

