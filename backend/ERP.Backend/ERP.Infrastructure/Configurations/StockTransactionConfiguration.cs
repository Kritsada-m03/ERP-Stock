using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Configurations;

public sealed class StockTransactionConfiguration : EntityConfiguration<StockTransaction>
{
    protected override void ConfigureEntity(EntityTypeBuilder<StockTransaction> builder)
    {
        builder.ToTable("StockTransactions", table => {
            table.HasCheckConstraint("CK_StockTransactions_QuantityDelta", "[QuantityDelta] <> 0");
            table.HasCheckConstraint("CK_StockTransactions_Type", "[Type] IN ('Receive', 'Adjustment', 'Dispatch')");
        });
        builder.Property(x => x.Type).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.QuantityDelta).HasPrecision(18, 3);
        builder.Property(x => x.Reason).HasMaxLength(500).IsRequired();
        builder.Property(x => x.OperationKey).HasMaxLength(100).IsRequired();
        builder.HasIndex(x => x.OperationKey).IsUnique();
        builder.HasIndex(x => new { x.StockId, x.CreatedAtUtc });
        builder.HasOne<Stock>().WithMany().HasForeignKey(x => x.StockId);
        builder.HasOne<SalesOrder>().WithMany().HasForeignKey(x => x.SalesOrderId);
        builder.HasOne<Delivery>().WithMany().HasForeignKey(x => x.DeliveryId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.PerformedByUserId);
    }
}

