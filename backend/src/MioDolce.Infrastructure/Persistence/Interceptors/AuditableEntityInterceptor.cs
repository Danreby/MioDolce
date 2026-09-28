using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using MioDolce.Domain.Common;

namespace MioDolce.Infrastructure.Persistence.Interceptors;

/// <summary>
/// Interceptor = "gancho" que o EF Core chama antes de salvar.
/// Preenche datas de auditoria e renova o token de concorrência de forma centralizada,
/// para que nenhum caso de uso precise lembrar de fazer isso manualmente.
/// </summary>
public sealed class AuditableEntityInterceptor(TimeProvider timeProvider) : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        Stamp(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        Stamp(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void Stamp(DbContext? context)
    {
        if (context is null)
        {
            return;
        }

        var now = timeProvider.GetUtcNow().UtcDateTime;

        foreach (var entry in context.ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Property(e => e.CreatedAtUtc).CurrentValue = now;
                    entry.Property(e => e.ConcurrencyStamp).CurrentValue = Guid.NewGuid();
                    break;

                case EntityState.Modified:
                    entry.Property(e => e.UpdatedAtUtc).CurrentValue = now;
                    // O valor ORIGINAL continua no WHERE; o novo valor vai no SET.
                    entry.Property(e => e.ConcurrencyStamp).CurrentValue = Guid.NewGuid();
                    break;

                default:
                    break;
            }
        }
    }
}
