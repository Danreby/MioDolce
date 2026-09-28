using Microsoft.AspNetCore.Mvc;
using MioDolce.Domain.Common;

namespace MioDolce.Api.Controllers;

/// <summary>
/// Classe base de todos os controllers da API.
///
/// - <see cref="ControllerBase"/> (e não <c>Controller</c>): API não renderiza Views,
///   então não precisamos do suporte a Razor que <c>Controller</c> traz.
/// - <see cref="ApiControllerAttribute"/> liga comportamentos de API: exige roteamento por atributo,
///   devolve 400 automático se o model binding falhar (ex.: JSON inválido), infere a origem dos
///   parâmetros ([FromBody], [FromRoute]...) e padroniza erros como ProblemDetails.
///   Colocado na base, vale para todos os controllers que herdam dela.
/// </summary>
[ApiController]
[Produces("application/json")]
public abstract class ApiControllerBase : ControllerBase
{
    /// <summary>
    /// Traduz um erro de negócio (Result) para a resposta HTTP correta.
    /// É o ÚNICO lugar da API que sabe que NotFound vira 404, Conflict vira 409 etc.
    /// </summary>
    protected ObjectResult Problem(Error error)
    {
        var (status, title) = error.Type switch
        {
            ErrorType.Validation => (StatusCodes.Status400BadRequest, "Dados inválidos"),
            ErrorType.NotFound => (StatusCodes.Status404NotFound, "Não encontrado"),
            ErrorType.Conflict => (StatusCodes.Status409Conflict, "Conflito"),
            ErrorType.BusinessRule => (StatusCodes.Status422UnprocessableEntity, "Regra de negócio violada"),
            _ => (StatusCodes.Status500InternalServerError, "Erro interno"),
        };

        // A fábrica aplica os padrões do ASP.NET (type, traceId) e o CustomizeProblemDetails do DI.
        var problem = ProblemDetailsFactory.CreateProblemDetails(HttpContext, status, title, detail: error.Description);
        problem.Extensions["code"] = error.Code;

        return new ObjectResult(problem) { StatusCode = status };
    }
}
