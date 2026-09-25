using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Configurations;

public sealed class PaymentConfiguration : EntityConfiguration<Payment>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments", table => {
            table.HasCheckConstraint("CK_Payments_Amount", "[Amount] > 0");
            table.HasCheckConstraint("CK_Payments_Currency", "[Currency] = 'THB'");
            table.HasCheckConstraint("CK_Payments_Status", "[Status] IN ('Pending', 'Verified', 'Rejected', 'Expired', 'Cancelled')");
        });
        builder.Property(x => x.PaymentNo).HasMaxLength(30).IsRequired();
        builder.HasIndex(x => x.PaymentNo).IsUnique();
        builder.Property(x => x.Amount).HasPrecision(18, 2);
        builder.Property(x => x.Currency).HasMaxLength(3).IsRequired();
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.QrPayload).HasMaxLength(2000);
        builder.Property(x => x.RecipientSnapshot).HasMaxLength(1000);
        builder.Property(x => x.ProviderReference).HasMaxLength(200);
        builder.Property(x => x.BankTransactionReference).HasMaxLength(200);
        builder.Property(x => x.EvidenceStorageKey).HasMaxLength(500);
        builder.HasIndex(x => x.SalesOrderId).IsUnique().HasFilter("[Status] = 'Verified'");
        builder.HasIndex(x => x.BankTransactionReference).IsUnique().HasFilter("[BankTransactionReference] IS NOT NULL");
        builder.HasOne<SalesOrder>().WithMany().HasForeignKey(x => x.SalesOrderId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.VerifiedByUserId);
        builder.HasAlternateKey(x => new { x.Id, x.SalesOrderId });
    }
}

