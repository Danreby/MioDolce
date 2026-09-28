using MioDolce.Application.Common;
using MioDolce.Domain.Products;
using MioDolce.Domain.Stock;

namespace MioDolce.Application.Features.Stock;

public sealed record StockMovementResponse(
    Guid Id,
    Guid ProductId,
    string ProductSku,
    string ProductName,
    UnitOfMeasure Unit,
    MovementType Type,
    decimal Delta,
    decimal BalanceAfter,
    string? Note,
    DateTime OccurredAtUtc);

/// <summary>
/// Para Entry/Exit, Quantity é quanto entrou/saiu.
/// Para Adjustment, Quantity é o saldo contado no inventário físico.
/// </summary>
public sealed record RegisterMovementRequest(MovementType Type, decimal Quantity, string? Note);

public sealed record MovementListQuery(
    Guid? ProductId = null,
    MovementType? Type = null,
    DateTime? FromUtc = null,
    DateTime? ToUtc = null,
    int Page = 1,
    int PageSize = Paging.DefaultPageSize) : IPagedQuery;
