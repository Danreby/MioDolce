using Microsoft.EntityFrameworkCore;
using MioDolce.Application.Abstractions;
using MioDolce.Application.Features.Products;
using MioDolce.Application.Features.Stock;
using MioDolce.Domain.Stock;

namespace MioDolce.Application.Features.Dashboard;

/// <summary>
/// Serviço somente leitura que agrega indicadores.
/// Atenção: as consultas rodam em SEQUÊNCIA de propósito. Um DbContext não é thread-safe,
/// então Task.WhenAll com o mesmo contexto lançaria exceção.
/// </summary>
public sealed class DashboardService(IApplicationDbContext db, TimeProvider timeProvider)
{
    public const int FlowDays = 14;
    private const int AttentionLimit = 6;
    private const int RecentLimit = 8;

    public async Task<DashboardResponse> GetAsync(CancellationToken cancellationToken)
    {
        var activeProducts = db.Products.AsNoTracking().Where(p => p.IsActive);

        var activeCount = await activeProducts.CountAsync(cancellationToken);
        var categoryCount = await db.Categories.CountAsync(cancellationToken);
        var inventoryValue = await activeProducts.SumAsync(p => p.QuantityOnHand * p.UnitCost, cancellationToken);
        var outOfStock = await activeProducts.CountAsync(p => p.QuantityOnHand <= 0, cancellationToken);
        var lowStock = await activeProducts.CountAsync(p => p.QuantityOnHand > 0 && p.QuantityOnHand <= p.MinimumStock, cancellationToken);

        var needsAttention = await activeProducts
            .Where(p => p.QuantityOnHand <= p.MinimumStock)
            .OrderBy(p => p.QuantityOnHand > 0)
            .ThenBy(p => p.QuantityOnHand - p.MinimumStock)
            .Take(AttentionLimit)
            .Select(ProductMappings.ToResponse)
            .ToListAsync(cancellationToken);

        var recent = await db.StockMovements
            .AsNoTracking()
            .OrderByDescending(m => m.OccurredAtUtc)
            .Take(RecentLimit)
            .Select(StockMappings.ToResponse)
            .ToListAsync(cancellationToken);

        var valueByCategory = await db.Categories
            .AsNoTracking()
            .Select(c => new CategoryValueResponse(
                c.Id,
                c.Name,
                db.Products.Count(p => p.IsActive && p.CategoryId == c.Id),
                db.Products
                    .Where(p => p.IsActive && p.CategoryId == c.Id)
                    .Sum(p => p.QuantityOnHand * p.UnitCost)))
            .ToListAsync(cancellationToken);

        return new DashboardResponse(
            activeCount,
            categoryCount,
            inventoryValue,
            lowStock,
            outOfStock,
            needsAttention,
            recent,
            [.. valueByCategory.OrderByDescending(c => c.Value)],
            await GetDailyFlowAsync(cancellationToken));
    }

    /// <summary>
    /// Agrupamento por dia feito em memória: o volume é pequeno (14 dias) e isso evita
    /// depender de funções de data específicas do MySQL na tradução do LINQ.
    /// </summary>
    private async Task<IReadOnlyList<DailyFlowResponse>> GetDailyFlowAsync(CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);
        var firstDay = today.AddDays(-(FlowDays - 1));
        var since = firstDay.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        var movements = await db.StockMovements
            .AsNoTracking()
            .Where(m => m.OccurredAtUtc >= since && m.Type != MovementType.Adjustment)
            .Select(m => new { m.OccurredAtUtc, m.Type, Value = m.Delta * m.Product!.UnitCost })
            .ToListAsync(cancellationToken);

        var byDay = movements.ToLookup(m => DateOnly.FromDateTime(m.OccurredAtUtc));

        return [.. Enumerable.Range(0, FlowDays)
            .Select(offset => firstDay.AddDays(offset))
            .Select(day => new DailyFlowResponse(
                day,
                byDay[day].Where(m => m.Type == MovementType.Entry).Sum(m => m.Value),
                byDay[day].Where(m => m.Type == MovementType.Exit).Sum(m => -m.Value)))];
    }
}
