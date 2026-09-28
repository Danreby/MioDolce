using System.Linq.Expressions;
using MioDolce.Domain.Products;
using MioDolce.Domain.Stock;

namespace MioDolce.Application.Features.Stock;

internal static class StockMappings
{
    public static readonly Expression<Func<StockMovement, StockMovementResponse>> ToResponse = m => new StockMovementResponse(
        m.Id,
        m.ProductId,
        m.Product!.Sku,
        m.Product.Name,
        m.Product.Unit,
        m.Type,
        m.Delta,
        m.BalanceAfter,
        m.Note,
        m.OccurredAtUtc);

    // Versão em memória, usada logo após registrar uma movimentação (o produto já está carregado).
    public static StockMovementResponse ToResponseFrom(this StockMovement m, Product product) => new(
        m.Id,
        product.Id,
        product.Sku,
        product.Name,
        product.Unit,
        m.Type,
        m.Delta,
        m.BalanceAfter,
        m.Note,
        m.OccurredAtUtc);
}
