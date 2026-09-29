using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MioDolce.Domain.Products;

namespace MioDolce.Infrastructure.Persistence.Configurations;

internal sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");
        builder.ConfigureAuditable();

        builder.Property(p => p.Sku).HasMaxLength(Product.SkuMaxLength).IsRequired();
        builder.Property(p => p.Name).HasMaxLength(Product.NameMaxLength).IsRequired();
        builder.Property(p => p.Description).HasMaxLength(Product.DescriptionMaxLength);

        // Enum salvo como texto ("Kilogram") em vez de número: o banco fica legível
        // e reordenar o enum no C# não corrompe os dados existentes.
        builder.Property(p => p.Unit).HasConversion<string>().HasMaxLength(20);

        // Sempre defina precisão de decimal. Dinheiro: 2 casas. Quantidade: 3 (ex.: 0,250 kg).
        builder.Property(p => p.UnitCost).HasPrecision(18, 2);
        builder.Property(p => p.QuantityOnHand).HasPrecision(18, 3);
        builder.Property(p => p.MinimumStock).HasPrecision(18, 3);

        // EXEMPLO DE MIGRATION (docs/06, exemplo 2): estas duas linhas + a propriedade Barcode
        // no model são tudo que a migration "AddBarcodeToProducts" precisou para ser gerada.
        builder.Property(p => p.Barcode).HasMaxLength(Product.BarcodeMaxLength);
        // Índice único em coluna ANULÁVEL: no MySQL, vários produtos podem ficar sem código
        // (NULL não conflita com NULL), mas dois produtos nunca têm o mesmo código.
        builder.HasIndex(p => p.Barcode).IsUnique();

        builder.HasIndex(p => p.Sku).IsUnique();
        builder.HasIndex(p => p.Name);

        // Restrict: o banco impede apagar uma categoria que ainda tem produtos.
        builder.HasOne(p => p.Category)
            .WithMany()
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
