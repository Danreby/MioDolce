using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MioDolce.Domain.Suppliers;

namespace MioDolce.Infrastructure.Persistence.Configurations;

/// <summary>
/// PASSO 2 do guia docs/06: como o model vira TABELA.
/// É daqui (e do DbSet no AppDbContext) que o "dotnet ef migrations add" tira as informações.
/// Sem esta classe o EF usaria convenções: varchar(255) para string, nome da tabela = nome do DbSet...
/// </summary>
internal sealed class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.ToTable("suppliers");
        builder.ConfigureAuditable(); // Id, CreatedAtUtc, UpdatedAtUtc, ConcurrencyStamp

        builder.Property(s => s.Name).HasMaxLength(Supplier.NameMaxLength).IsRequired();

        // IsFixedLength → char(14) em vez de varchar(14): todo CNPJ tem exatamente 14 dígitos.
        builder.Property(s => s.TaxId).HasMaxLength(Supplier.TaxIdLength).IsFixedLength().IsRequired();

        builder.Property(s => s.Email).HasMaxLength(Supplier.EmailMaxLength);
        builder.Property(s => s.Phone).HasMaxLength(Supplier.PhoneMaxLength);

        // Índice único: o banco é a garantia final contra CNPJ duplicado.
        builder.HasIndex(s => s.TaxId).IsUnique();
        builder.HasIndex(s => s.Name);
    }
}
