using Microsoft.AspNetCore.Http.HttpResults;
using MioDolce.Api.Extensions;
using MioDolce.Api.Filters;
using MioDolce.Application.Common;
using MioDolce.Application.Features.Stock;

namespace MioDolce.Api.Endpoints;

internal static class StockEndpoints
{
    public static IEndpointRouteBuilder MapStockEndpoints(this IEndpointRouteBuilder api)
    {
        // Movimentação é um sub-recurso do produto: POST /api/products/{id}/movements.
        api.MapPost("/products/{productId:guid}/movements", RegisterAsync)
            .WithTags("Movimentações")
            .WithRequestValidation<RegisterMovementRequest>()
            .WithSummary("Registra entrada, saída ou ajuste de inventário");

        // A consulta é transversal (todos os produtos), então tem sua própria rota.
        api.MapGet("/movements", ListAsync)
            .WithTags("Movimentações")
            .WithRequestValidation<MovementListQuery>()
            .WithSummary("Histórico de movimentações com filtros e paginação");

        return api;
    }

    private static async Task<Ok<PagedResponse<StockMovementResponse>>> ListAsync(
        [AsParameters] MovementListQuery query,
        StockService service,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await service.ListAsync(query, cancellationToken));

    private static async Task<Results<Created<StockMovementResponse>, ProblemHttpResult>> RegisterAsync(
        Guid productId,
        RegisterMovementRequest request,
        StockService service,
        CancellationToken cancellationToken)
    {
        var result = await service.RegisterAsync(productId, request, cancellationToken);
        return result.IsSuccess
            ? TypedResults.Created($"/api/movements?productId={productId}", result.Value)
            : result.ToProblem();
    }
}
