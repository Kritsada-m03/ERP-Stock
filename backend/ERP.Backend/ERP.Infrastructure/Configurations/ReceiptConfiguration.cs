using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Configurations;

public sealed class ReceiptConfiguration : EntityConfiguration<Receipt>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Receipt> builder)
    {
        builder.ToTable("Receipts", table => {
            table.HasCheckConstraint("CK_Receipts_TotalAmount", "[TotalAmount] > 0");
            table.HasCheckConstraint("CK_Receipts_Snapshot", "ISJSON([DocumentSnapshotJson]) = 1 AND [SnapshotVersion] > 0");
        });
        builder.Property(x => x.ReceiptNo).HasMaxLength(30).IsRequired();
        builder.HasIndex(x => x.ReceiptNo).IsUnique();
        builder.HasIndex(x => x.SalesOrderId).IsUnique();
        builder.HasIndex(x => x.PaymentId).IsUnique();
        builder.Property(x => x.TotalAmount).HasPrecision(18, 2);
        builder.Property(x => x.DocumentSnapshotJson).IsRequired();
        builder.HasOne<SalesOrder>().WithMany().HasForeignKey(x => x.SalesOrderId);
        builder.HasOne<Payment>().WithMany().HasForeignKey(x => new { x.PaymentId, x.SalesOrderId })
            .HasPrincipalKey(x => new { x.Id, x.SalesOrderId });
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.IssuedByUserId);
    }
}

