using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Configurations;

public sealed class CustomerConfiguration : EntityConfiguration<Customer>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers");
        builder.Property(x => x.Code).HasMaxLength(30).IsRequired();
        builder.HasIndex(x => x.Code).IsUnique();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Phone).HasMaxLength(30);
        builder.Property(x => x.Email).HasMaxLength(254);
        builder.Property(x => x.Address).HasMaxLength(1000);
        builder.Property(x => x.ContactName).HasMaxLength(200);
        builder.Property(x => x.TaxId).HasMaxLength(13);
        builder.Property(x => x.Notes).HasMaxLength(1000);
    }
}

