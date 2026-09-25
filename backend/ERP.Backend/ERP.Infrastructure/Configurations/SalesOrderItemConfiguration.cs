using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Configurations;

public sealed class SalesOrderItemConfiguration : EntityConfiguration<SalesOrderItem>
{
    protected override void ConfigureEntity(EntityTypeBuilder<SalesOrderItem> builder)
    {
        builder.ToTable("SalesOrderItems", table => {
            table.HasCheckConstraint("CK_SalesOrderItems_Quantity", "[Quantity] > 0 AND [ReservedQuantity] >= 0 AND [ReservedQuantity] <= [Quantity]");
            table.HasCheckConstraint("CK_SalesOrderItems_Amounts", "[UnitPrice] >= 0 AND [DiscountAmount] >= 0 AND [LineTotal] >= 0");
            table.HasCheckConstraint("CK_SalesOrderItems_LineNo", "[LineNo] > 0");
        });
        builder.Property(x => x.SkuSnapshot).HasMaxLength(50).IsRequired();
        builder.Property(x => x.ProductNameSnapshot).HasMaxLength(200).IsRequired();
        builder.Property(x => x.UnitNameSnapshot).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Quantity).HasPrecision(18, 3);
        builder.Property(x => x.ReservedQuantity).HasPrecision(18, 3);
        builder.Property(x => x.UnitPrice).HasPrecision(18, 2);
        builder.Property(x => x.DiscountAmount).HasPrecision(18, 2);
        builder.Property(x => x.LineTotal).HasPrecision(18, 2);
        builder.HasIndex(x => new { x.SalesOrderId, x.LineNo }).IsUnique();
        builder.HasOne<Product>().WithMany().HasForeignKey(x => x.ProductId);
    }
}

