using Microsoft.AspNetCore.Mvc;
using MioDolce.Application.Features.Suppliers;

namespace MioDolce.Api.Controllers;

/// <summary>
/// PASSO 9 do guia docs/06: o CONTROLLER.
///
/// Checklist de um controller de API:
///   [x] herda de ApiControllerBase (que tem [ApiController] e o helper Problem(Error));
///   [x] [Route] com o prefixo do recurso;
///   [x] uma action por operação, com o verbo HTTP no atributo ([HttpGet], [HttpPost]...);
///   [x] recebe o serviço pelo construtor e NÃO acessa o banco diretamente;
///   [x] devolve status corretos (200, 201 + Location, 204, 400, 404, 409);
///   [x] [ProducesResponseType] documenta cada status para o OpenAPI/Scalar.
/// Não há nada para registrar: AddControllers() + MapControllers() descobrem a classe sozinhos.
/// </summary>
[Route("api/suppliers")]
[Tags("Fornecedores")]
public sealed class SuppliersController(SupplierService service) : ApiControllerBase
{
    // GET api/suppliers?search=cacau
    // Tipo simples (string) é inferido como query string; [FromQuery] aqui só deixa explícito.
    [HttpGet]
    [EndpointSummary("Lista fornecedores, com busca opcional por nome ou CNPJ")]
    [ProducesResponseType<IReadOnlyList<SupplierResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SupplierResponse>>> List(
        [FromQuery] string? search,
        CancellationToken cancellationToken) =>
        Ok(await service.ListAsync(search, cancellationToken));

    // GET api/suppliers/{id}
    [HttpGet("{id:guid}")]
    [EndpointSummary("Detalha um fornecedor")]
    [ProducesResponseType<SupplierResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SupplierResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.GetAsync(id, cancellationToken);
        return result.IsSuccess ? result.Value : Problem(result.Error);
    }

    // POST api/suppliers   (corpo: SupplierRequest em JSON)
    [HttpPost]
    [EndpointSummary("Cadastra um fornecedor")]
    [ProducesResponseType<SupplierResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SupplierResponse>> Create(SupplierRequest request, CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(request, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : Problem(result.Error);
    }

    // PUT api/suppliers/{id}   (id da rota + corpo JSON)
    [HttpPut("{id:guid}")]
    [EndpointSummary("Edita um fornecedor")]
    [ProducesResponseType<SupplierResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SupplierResponse>> Update(Guid id, SupplierRequest request, CancellationToken cancellationToken)
    {
        var result = await service.UpdateAsync(id, request, cancellationToken);
        return result.IsSuccess ? result.Value : Problem(result.Error);
    }

    // DELETE api/suppliers/{id}
    [HttpDelete("{id:guid}")]
    [EndpointSummary("Exclui um fornecedor")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.DeleteAsync(id, cancellationToken);
        return result.IsSuccess ? NoContent() : Problem(result.Error);
    }
}
