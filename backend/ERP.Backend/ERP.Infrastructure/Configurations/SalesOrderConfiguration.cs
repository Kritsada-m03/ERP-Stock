using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Configurations;

public sealed class SalesOrderConfiguration : EntityConfiguration<SalesOrder>
{
    protected override void ConfigureEntity(EntityTypeBuilder<SalesOrder> builder)
    {
        builder.ToTable("SalesOrders", table => {
            table.HasCheckConstraint("CK_SalesOrders_Amounts", "[Subtotal] >= 0 AND [DiscountAmount] >= 0 AND [DiscountAmount] <= [Subtotal] AND [TotalAmount] = [Subtotal] - [DiscountAmount]");
            table.HasCheckConstraint("CK_SalesOrders_Status", "[Status] IN ('Draft', 'StockChecked', 'Confirmed', 'AwaitingPayment', 'Paid', 'Receipted', 'Preparing', 'ReadyToShip', 'Shipped', 'Completed', 'Cancelled')");
        });
        builder.Property(x => x.OrderNo).HasMaxLength(30).IsRequired();
        builder.HasIndex(x => x.OrderNo).IsUnique();
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.CustomerNameSnapshot).HasMaxLength(200).IsRequired();
        builder.Property(x => x.DeliveryAddressSnapshot).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.Subtotal).HasPrecision(18, 2);
        builder.Property(x => x.DiscountAmount).HasPrecision(18, 2);
        builder.Property(x => x.TotalAmount).HasPrecision(18, 2);
        builder.HasOne<Customer>().WithMany().HasForeignKey(x => x.CustomerId);
        builder.HasOne<Warehouse>().WithMany().HasForeignKey(x => x.WarehouseId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserId);
        builder.HasMany(x => x.Items).WithOne().HasForeignKey(x => x.SalesOrderId);
        builder.HasIndex(x => new { x.Status, x.CreatedAtUtc });
    }
}

