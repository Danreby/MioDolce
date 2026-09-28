using Microsoft.EntityFrameworkCore;
using MioDolce.Domain.Categories;
using MioDolce.Domain.Products;
using MioDolce.Domain.Stock;
using MioDolce.Domain.Suppliers;

namespace MioDolce.Application.Abstractions;

/// <summary>
/// Abstração do banco de dados vista pela Application (Inversão de Dependência — o "D" do SOLID).
/// A Application declara O QUE precisa; a Infrastructure fornece o COMO (AppDbContext + MySQL).
///
/// Por que não um "Repository" para cada entidade? O DbContext do EF Core já implementa
/// os padrões Repository (DbSet) e Unit of Work (SaveChanges). Envolver isso em outra camada
/// costuma só adicionar código sem benefício real em um projeto deste tamanho.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<Category> Categories { get; }

    DbSet<Product> Products { get; }

    DbSet<StockMovement> StockMovements { get; }

    DbSet<Supplier> Suppliers { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
