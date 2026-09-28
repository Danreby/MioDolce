using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MioDolce.Application.Abstractions;
using MioDolce.Application.Common;
using MioDolce.Domain.Common;
using MioDolce.Domain.Products;
using MioDolce.Domain.Stock;

namespace MioDolce.Application.Features.Stock;

public sealed partial class StockService(
    IApplicationDbContext db,
    TimeProvider timeProvider,
    ILogger<StockService> logger)
{
    public Task<PagedResponse<StockMovementResponse>> ListAsync(MovementListQuery query, CancellationToken cancellationToken)
    {
        var movements = db.StockMovements.AsNoTracking();

        if (query.ProductId is { } productId)
        {
            movements = movements.Where(m => m.ProductId == productId);
        }

        if (query.Type is { } type)
        {
            movements = movements.Where(m => m.Type == type);
        }

        if (query.FromUtc is { } from)
        {
            movements = movements.Where(m => m.OccurredAtUtc >= from);
        }

        if (query.ToUtc is { } to)
        {
            movements = movements.Where(m => m.OccurredAtUtc <= to);
        }

        return movements
            .OrderByDescending(m => m.OccurredAtUtc)
            .ThenByDescending(m => m.Id)
            .Select(StockMappings.ToResponse)
            .ToPagedResponseAsync(query.Page, query.PageSize, cancellationToken);
    }

    /// <summary>
    /// Fluxo típico de um caso de uso que ALTERA estado:
    /// 1. carrega o agregado (rastreado pelo EF);
    /// 2. delega a regra de negócio ao domínio;
    /// 3. persiste; 4. devolve o contrato de resposta.
    /// </summary>
    public async Task<Result<StockMovementResponse>> RegisterAsync(
        Guid productId,
        RegisterMovementRequest request,
        CancellationToken cancellationToken)
    {
        var product = await db.Products.FindAsync([productId], cancellationToken);
        if (product is null)
        {
            return ProductErrors.NotFound(productId);
        }

        var result = product.RegisterMovement(
            request.Type,
            request.Quantity,
            request.Note,
            timeProvider.GetUtcNow().UtcDateTime);

        if (result.IsFailure)
        {
            return result.Error;
        }

        var movement = result.Value;
        db.StockMovements.Add(movement);

        // Se outra requisição alterou o saldo deste produto no meio do caminho, o
        // ConcurrencyStamp não bate e o UPDATE é rejeitado: nada de saldo negativo por corrida.
        var saved = await db.SaveChangesSafelyAsync(cancellationToken);
        if (saved.IsFailure)
        {
            return saved.Error;
        }

        LogMovementRegistered(movement.Type, movement.Delta, product.Sku, movement.BalanceAfter);

        return movement.ToResponseFrom(product);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Movimentação {Type} de {Delta} no produto {Sku}; novo saldo {Balance}")]
    private partial void LogMovementRegistered(MovementType type, decimal delta, string sku, decimal balance);
}
