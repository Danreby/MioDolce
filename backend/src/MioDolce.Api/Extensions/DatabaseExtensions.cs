using Microsoft.EntityFrameworkCore;
using MioDolce.Infrastructure.Persistence;

namespace MioDolce.Api.Extensions;

internal static class DatabaseExtensions
{
    /// <summary>
    /// Aplica as migrations pendentes na inicialização. Prático em desenvolvimento;
    /// em produção prefira rodar as migrations no pipeline de deploy (script SQL ou bundle),
    /// para não depender de várias instâncias da API disputando a mesma migração.
    /// </summary>
    public static async Task ApplyMigrationsAsync(this WebApplication app)
    {
        // O DbContext é Scoped; fora de uma requisição precisamos criar um escopo manualmente.
        await using var scope = app.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
    }
}
