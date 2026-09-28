using Microsoft.AspNetCore.Mvc;
using MioDolce.Application.Common;
using MioDolce.Application.Features.Stock;

namespace MioDolce.Api.Controllers;

/// <summary>
/// Um controller não precisa mapear um único prefixo. Aqui o prefixo é só "api" e cada
/// action define o resto: a movimentação é criada como sub-recurso do produto
/// (POST api/products/{id}/movements), mas consultada por uma rota própria (GET api/movements).
/// </summary>
[Route("api")]
[Tags("Movimentações")]
public sealed class StockMovementsController(StockService service) : ApiControllerBase
{
    [HttpGet("movements")]
    [EndpointSummary("Histórico de movimentações com filtros e paginação")]
    [ProducesResponseType<PagedResponse<StockMovementResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResponse<StockMovementResponse>>> List(
        [FromQuery] MovementListQuery query,
        CancellationToken cancellationToken) =>
        Ok(await service.ListAsync(query, cancellationToken));

    // "productId" vem da rota (inferido pelo nome), "request" do corpo JSON.
    [HttpPost("products/{productId:guid}/movements")]
    [EndpointSummary("Registra entrada, saída ou ajuste de inventário")]
    [ProducesResponseType<StockMovementResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<StockMovementResponse>> Register(
        Guid productId,
        RegisterMovementRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.RegisterAsync(productId, request, cancellationToken);
        return result.IsSuccess
            ? Created($"/api/movements?productId={productId}", result.Value)
            : Problem(result.Error);
    }
}
