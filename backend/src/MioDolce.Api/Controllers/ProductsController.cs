using Microsoft.AspNetCore.Mvc;
using MioDolce.Application.Common;
using MioDolce.Application.Features.Products;

namespace MioDolce.Api.Controllers;

[Route("api/products")]
[Tags("Produtos")]
public sealed class ProductsController(ProductService service) : ApiControllerBase
{
    // GET api/products?search=choco&status=Low&page=2
    // [FromQuery] é OBRIGATÓRIO aqui: sem ele, o [ApiController] trataria o record como corpo JSON.
    // Cada parâmetro do construtor do record vira um parâmetro da query string.
    [HttpGet]
    [EndpointSummary("Lista produtos com busca, filtros, ordenação e paginação")]
    [ProducesResponseType<PagedResponse<ProductResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResponse<ProductResponse>>> List(
        [FromQuery] ProductListQuery query,
        CancellationToken cancellationToken) =>
        Ok(await service.ListAsync(query, cancellationToken));

    [HttpGet("{id:guid}")]
    [EndpointSummary("Detalha um produto")]
    [ProducesResponseType<ProductResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.GetAsync(id, cancellationToken);
        return result.IsSuccess ? result.Value : Problem(result.Error);
    }

    [HttpPost]
    [EndpointSummary("Cadastra um produto (opcionalmente com saldo inicial)")]
    [ProducesResponseType<ProductResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ProductResponse>> Create(CreateProductRequest request, CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(request, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : Problem(result.Error);
    }

    [HttpPut("{id:guid}")]
    [EndpointSummary("Edita os dados cadastrais (o saldo só muda por movimentação)")]
    [ProducesResponseType<ProductResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ProductResponse>> Update(Guid id, UpdateProductRequest request, CancellationToken cancellationToken)
    {
        var result = await service.UpdateAsync(id, request, cancellationToken);
        return result.IsSuccess ? result.Value : Problem(result.Error);
    }

    [HttpDelete("{id:guid}")]
    [EndpointSummary("Exclui um produto que nunca foi movimentado")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.DeleteAsync(id, cancellationToken);
        return result.IsSuccess ? NoContent() : Problem(result.Error);
    }
}
