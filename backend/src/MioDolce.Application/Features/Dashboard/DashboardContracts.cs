using MioDolce.Application.Features.Products;
using MioDolce.Application.Features.Stock;

namespace MioDolce.Application.Features.Dashboard;

public sealed record DashboardResponse(
    int ActiveProducts,
    int Categories,
    decimal InventoryValue,
    int LowStockCount,
    int OutOfStockCount,
    IReadOnlyList<ProductResponse> NeedsAttention,
    IReadOnlyList<StockMovementResponse> RecentMovements,
    IReadOnlyList<CategoryValueResponse> ValueByCategory,
    IReadOnlyList<DailyFlowResponse> DailyFlow);

public sealed record CategoryValueResponse(Guid CategoryId, string Name, int ProductCount, decimal Value);

/// <summary>Valor (custo) que entrou e saiu do estoque em um dia.</summary>
public sealed record DailyFlowResponse(DateOnly Date, decimal EntriesValue, decimal ExitsValue);
