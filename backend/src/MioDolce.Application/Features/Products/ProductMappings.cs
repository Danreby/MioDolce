using System.Linq.Expressions;
using MioDolce.Domain.Products;

namespace MioDolce.Application.Features.Products;

/// <summary>
/// Mapeamento manual entidade → DTO.
/// Por ser uma Expression (e não um método comum), o EF Core consegue traduzi-la para SQL:
/// a consulta traz só as colunas usadas e faz o JOIN com a categoria automaticamente.
/// Bibliotecas como AutoMapper fazem algo parecido, mas escondem o que acontece (e hoje são pagas).
/// </summary>
internal static class ProductMappings
{
    public static readonly Expression<Func<Product, ProductResponse>> ToResponse = p => new ProductResponse(
        p.Id,
        p.Sku,
        p.Name,
        p.Description,
        p.Barcode,
        p.CategoryId,
        p.Category!.Name,
        p.Unit,
        p.UnitCost,
        p.QuantityOnHand,
        p.MinimumStock,
        p.QuantityOnHand * p.UnitCost,
        p.QuantityOnHand <= 0 ? StockStatus.OutOfStock
            : p.QuantityOnHand <= p.MinimumStock ? StockStatus.Low
            : StockStatus.Ok,
        p.IsActive,
        p.CreatedAtUtc,
        p.UpdatedAtUtc);
}
