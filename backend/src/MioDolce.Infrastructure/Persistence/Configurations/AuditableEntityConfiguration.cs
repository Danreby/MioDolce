using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MioDolce.Domain.Common;

namespace MioDolce.Infrastructure.Persistence.Configurations;

internal static class AuditableEntityConfiguration
{
    /// <summary>Mapeamento comum a toda entidade auditável.</summary>
    public static void ConfigureAuditable<T>(this EntityTypeBuilder<T> builder)
        where T : AuditableEntity
    {
        builder.HasKey(e => e.Id);

        // O Guid é gerado no C# (v7), não pelo banco.
        builder.Property(e => e.Id).ValueGeneratedNever();

        builder.Property(e => e.CreatedAtUtc).IsRequired();

        // Entra no WHERE de todo UPDATE/DELETE: "... WHERE Id = @id AND ConcurrencyStamp = @original".
        builder.Property(e => e.ConcurrencyStamp).IsConcurrencyToken();
    }
}
