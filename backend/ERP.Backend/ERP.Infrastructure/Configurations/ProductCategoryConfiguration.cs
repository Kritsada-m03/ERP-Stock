using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Configurations;

public sealed class ProductCategoryConfiguration : EntityConfiguration<ProductCategory>
{
    protected override void ConfigureEntity(EntityTypeBuilder<ProductCategory> builder)
    {
        builder.ToTable("ProductCategories");
        builder.Property(x => x.Name).HasMaxLength(150).IsRequired();
    }
}

