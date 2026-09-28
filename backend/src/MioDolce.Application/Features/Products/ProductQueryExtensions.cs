using MioDolce.Domain.Products;

namespace MioDolce.Application.Features.Products;

/// <summary>
/// Filtros e ordenação como métodos de extensão sobre IQueryable.
/// Nada é executado aqui: apenas montamos a árvore de expressão que vira o WHERE/ORDER BY do SQL.
/// </summary>
internal static class ProductQueryExtensions
{
    public static IQueryable<Product> ApplyFilters(this IQueryable<Product> query, ProductListQuery filters)
    {
        if (!filters.IncludeInactive)
        {
            query = query.Where(p => p.IsActive);
        }

        if (filters.CategoryId is { } categoryId)
        {
            query = query.Where(p => p.CategoryId == categoryId);
        }

        if (!string.IsNullOrWhiteSpace(filters.Search))
        {
            var term = filters.Search.Trim();
            query = query.Where(p => p.Name.Contains(term) || p.Sku.Contains(term));
        }

        return filters.Status switch
        {
            StockStatus.OutOfStock => query.Where(p => p.QuantityOnHand <= 0),
            StockStatus.Low => query.Where(p => p.QuantityOnHand > 0 && p.QuantityOnHand <= p.MinimumStock),
            StockStatus.Ok => query.Where(p => p.QuantityOnHand > 0 && p.QuantityOnHand > p.MinimumStock),
            _ => query,
        };
    }

    // O Id entra sempre como critério de desempate: sem ele, itens "iguais" podem trocar de página.
    public static IQueryable<Product> ApplySort(this IQueryable<Product> query, ProductSort sort) => sort switch
    {
        ProductSort.Sku => query.OrderBy(p => p.Sku).ThenBy(p => p.Id),
        ProductSort.LowestStock => query.OrderBy(p => p.QuantityOnHand - p.MinimumStock).ThenBy(p => p.Id),
        ProductSort.HighestValue => query.OrderByDescending(p => p.QuantityOnHand * p.UnitCost).ThenBy(p => p.Id),
        ProductSort.Newest => query.OrderByDescending(p => p.CreatedAtUtc).ThenBy(p => p.Id),
        _ => query.OrderBy(p => p.Name).ThenBy(p => p.Id),
    };
}
