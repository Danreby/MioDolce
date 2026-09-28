using Microsoft.AspNetCore.Http.HttpResults;
using MioDolce.Domain.Common;

namespace MioDolce.Api.Extensions;

/// <summary>
/// Ponte entre o Result da Application e o HTTP. É o ÚNICO lugar que sabe
/// que "NotFound" vira 404, "Conflict" vira 409 etc.
/// </summary>
internal static class ResultExtensions
{
    public static ProblemHttpResult ToProblem(this Result result)
    {
        if (result.IsSuccess)
        {
            throw new InvalidOperationException("Não é possível converter um resultado de sucesso em erro.");
        }

        var (status, title) = result.Error.Type switch
        {
            ErrorType.Validation => (StatusCodes.Status400BadRequest, "Dados inválidos"),
            ErrorType.NotFound => (StatusCodes.Status404NotFound, "Não encontrado"),
            ErrorType.Conflict => (StatusCodes.Status409Conflict, "Conflito"),
            ErrorType.BusinessRule => (StatusCodes.Status422UnprocessableEntity, "Regra de negócio violada"),
            _ => (StatusCodes.Status500InternalServerError, "Erro interno"),
        };

        return TypedResults.Problem(
            title: title,
            detail: result.Error.Description,
            statusCode: status,
            extensions: new Dictionary<string, object?> { ["code"] = result.Error.Code });
    }
}
