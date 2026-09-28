using System.Text.Json;
using FluentValidation;

namespace MioDolce.Api.Filters;

/// <summary>
/// Endpoint filter = middleware que roda só para um endpoint específico, ANTES do handler.
/// Localiza o argumento do tipo T, valida com FluentValidation e, se inválido,
/// devolve 400 com ValidationProblemDetails: { errors: { "campo": ["mensagem"] } }.
/// </summary>
internal sealed class ValidationFilter<T>(IValidator<T> validator) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var argument = context.Arguments.OfType<T>().FirstOrDefault();
        if (argument is null)
        {
            return TypedResults.Problem(
                title: "Requisição inválida",
                detail: "O corpo da requisição é obrigatório.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        var result = await validator.ValidateAsync(argument, context.HttpContext.RequestAborted);
        if (result.IsValid)
        {
            return await next(context);
        }

        // Chaves em camelCase para bater com os nomes do JSON que o front-end enviou.
        var errors = result.Errors
            .GroupBy(e => JsonNamingPolicy.CamelCase.ConvertName(e.PropertyName))
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).Distinct().ToArray());

        return TypedResults.ValidationProblem(errors, title: "Há campos inválidos");
    }
}

internal static class ValidationFilterExtensions
{
    /// <summary>Uso: <c>group.MapPost(...).WithRequestValidation&lt;MeuRequest&gt;()</c>.</summary>
    public static RouteHandlerBuilder WithRequestValidation<T>(this RouteHandlerBuilder builder) =>
        builder
            .AddEndpointFilter<ValidationFilter<T>>()
            .ProducesValidationProblem();
}
