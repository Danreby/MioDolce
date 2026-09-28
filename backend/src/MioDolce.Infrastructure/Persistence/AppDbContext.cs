using Microsoft.EntityFrameworkCore;
using MioDolce.Application.Abstractions;
using MioDolce.Domain.Categories;
using MioDolce.Domain.Products;
using MioDolce.Domain.Stock;

namespace MioDolce.Infrastructure.Persistence;

/// <summary>
/// Implementação concreta do banco. O mapeamento de cada entidade fica em
/// Persistence/Configurations (um arquivo por entidade), mantendo o contexto enxuto
/// e o domínio livre de atributos de banco de dados.
/// </summary>
public sealed class AppDbContext : DbContext, IApplicationDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
        // IMPORTANTE — lição aprendida neste projeto:
        // Desde o EF Core 7, o SaveChanges pode NÃO abrir transação quando o provider julga
        // que o lote de comandos já é atômico. Com o provider MySQL da Oracle isso deixou
        // um INSERT de movimentação gravado mesmo quando o UPDATE do produto falhou por
        // concorrência (saldo e histórico ficavam divergentes).
        // "Always" garante: todos os comandos de um SaveChanges são confirmados juntos ou nenhum.
        Database.AutoTransactionBehavior = AutoTransactionBehavior.Always;
    }

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Product> Products => Set<Product>();

    public DbSet<StockMovement> StockMovements => Set<StockMovement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Descobre e aplica todas as classes IEntityTypeConfiguration<T> deste assembly.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
