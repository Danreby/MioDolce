using Microsoft.AspNetCore.Mvc;
using MioDolce.Application.Features.Categories;

namespace MioDolce.Api.Controllers;

/// <summary>
/// Controller = classe que agrupa as ações (actions) de um recurso.
///
/// ROTA: [Route] na classe define o prefixo; [HttpGet("{id:guid}")] na action completa o caminho.
/// Poderíamos usar [Route("api/[controller]")] ("[controller]" = nome da classe sem "Controller"),
/// mas a rota explícita não muda sem querer se alguém renomear a classe.
///
/// DEPENDÊNCIAS: recebidas pelo construtor (aqui, construtor primário do C# 12).
/// O ASP.NET cria uma instância NOVA do controller a cada requisição.
/// </summary>
[Route("api/categories")]
[Tags("Categorias")]
public sealed class CategoriesController(CategoryService service) : ApiControllerBase
{
    // GET api/categories
    [HttpGet]
    [EndpointSummary("Lista todas as categorias com a contagem de produtos")]
    [ProducesResponseType<IReadOnlyList<CategoryResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CategoryResponse>>> List(CancellationToken cancellationToken) =>
        Ok(await service.ListAsync(cancellationToken));

    // GET api/categories/{id}
    // {id:guid} é uma RESTRIÇÃO de rota: "api/categories/abc" nem chega aqui (vira 404).
    //
    // ATENÇÃO: o nome da action NÃO termina em "Async". O MVC remove esse sufixo dos nomes
    // de action, e aí CreatedAtAction(nameof(GetByIdAsync)) não encontraria a rota.
    [HttpGet("{id:guid}")]
    [EndpointSummary("Detalha uma categoria")]
    [ProducesResponseType<CategoryResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CategoryResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.GetAsync(id, cancellationToken);

        // ActionResult<T> aceita tanto o valor (vira 200 OK) quanto um ActionResult de erro.
        return result.IsSuccess ? result.Value : Problem(result.Error);
    }

    // POST api/categories
    // Com [ApiController], um parâmetro de tipo complexo vem do CORPO (JSON) automaticamente,
    // como se tivesse [FromBody]. O filtro de validação roda antes desta action.
    [HttpPost]
    [EndpointSummary("Cria uma categoria")]
    [ProducesResponseType<CategoryResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CategoryResponse>> Create(CategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(request, cancellationToken);
        if (result.IsFailure)
        {
            return Problem(result.Error);
        }

        // 201 Created + cabeçalho Location: /api/categories/{id} (montado a partir da action GetById).
        return CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value);
    }

    // PUT api/categories/{id}
    [HttpPut("{id:guid}")]
    [EndpointSummary("Renomeia/edita uma categoria")]
    [ProducesResponseType<CategoryResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CategoryResponse>> Update(Guid id, CategoryRequest request, CancellationToken cancellationToken)
    {
        var result = await service.UpdateAsync(id, request, cancellationToken);
        return result.IsSuccess ? result.Value : Problem(result.Error);
    }

    // DELETE api/categories/{id}
    [HttpDelete("{id:guid}")]
    [EndpointSummary("Exclui uma categoria sem produtos")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.DeleteAsync(id, cancellationToken);
        return result.IsSuccess ? NoContent() : Problem(result.Error);
    }
}
