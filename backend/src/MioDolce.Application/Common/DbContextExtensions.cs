using Microsoft.EntityFrameworkCore;
using MioDolce.Application.Abstractions;
using MioDolce.Domain.Common;

namespace MioDolce.Application.Common;

internal static class DbContextExtensions
{
    /// <summary>
    /// Salva e converte o conflito de concorrência otimista em um erro de negócio.
    /// DbUpdateConcurrencyException acontece quando o ConcurrencyStamp lido não bate mais
    /// com o do banco, ou seja, outra requisição alterou o mesmo registro antes de nós.
    /// </summary>
    public static async Task<Result> SaveChangesSafelyAsync(this IApplicationDbContext db, CancellationToken cancellationToken)
    {
        try
        {
            await db.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
        catch (DbUpdateConcurrencyException)
        {
            return CommonErrors.ConcurrencyConflict;
        }
    }
}
