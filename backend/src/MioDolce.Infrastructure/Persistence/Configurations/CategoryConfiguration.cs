using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MioDolce.Domain.Categories;

namespace MioDolce.Infrastructure.Persistence.Configurations;

internal sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories");
        builder.ConfigureAuditable();

        builder.Property(c => c.Name).HasMaxLength(Category.NameMaxLength).IsRequired();
        builder.Property(c => c.Description).HasMaxLength(Category.DescriptionMaxLength);

        // Índice único: a garantia final contra nomes duplicados é do banco, não do código.
        builder.HasIndex(c => c.Name).IsUnique();
    }
}
