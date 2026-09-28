using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MioDolce.Domain.Stock;

namespace MioDolce.Infrastructure.Persistence.Configurations;

internal sealed class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("stock_movements");

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).ValueGeneratedNever();

        builder.Property(m => m.Type).HasConversion<string>().HasMaxLength(20);
        builder.Property(m => m.Delta).HasPrecision(18, 3);
        builder.Property(m => m.BalanceAfter).HasPrecision(18, 3);
        builder.Property(m => m.Note).HasMaxLength(StockMovement.NoteMaxLength);

        // Índices pensados nas consultas reais: histórico por produto e listagem por data.
        builder.HasIndex(m => new { m.ProductId, m.OccurredAtUtc });
        builder.HasIndex(m => m.OccurredAtUtc);

        builder.HasOne(m => m.Product)
            .WithMany()
            .HasForeignKey(m => m.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
