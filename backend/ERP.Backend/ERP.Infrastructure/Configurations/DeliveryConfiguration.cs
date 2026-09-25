using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Configurations;

public sealed class DeliveryConfiguration : EntityConfiguration<Delivery>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Delivery> builder)
    {
        builder.ToTable("Deliveries", table => {
            table.HasCheckConstraint("CK_Deliveries_Status", "[Status] IN ('Preparing', 'ReadyToShip', 'Shipped', 'Completed')");
            table.HasCheckConstraint("CK_Deliveries_Snapshot", "([DocumentSnapshotJson] IS NULL OR ISJSON([DocumentSnapshotJson]) = 1) AND [SnapshotVersion] > 0");
        });
        builder.Property(x => x.DeliveryNo).HasMaxLength(30).IsRequired();
        builder.HasIndex(x => x.DeliveryNo).IsUnique();
        builder.HasIndex(x => x.SalesOrderId).IsUnique();
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.RecipientNameSnapshot).HasMaxLength(200).IsRequired();
        builder.Property(x => x.AddressSnapshot).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.TrackingNo).HasMaxLength(100);
        builder.HasOne<SalesOrder>().WithMany().HasForeignKey(x => x.SalesOrderId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.IssuedByUserId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.ShippedByUserId);
    }
}

