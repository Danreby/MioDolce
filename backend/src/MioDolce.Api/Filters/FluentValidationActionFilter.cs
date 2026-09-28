using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace MioDolce.Api.Filters;

/// <summary>
/// Action filter GLOBAL: roda antes de toda action de controller.
///
/// Pipeline de uma requisição MVC (simplificado):
///   roteamento → model binding (JSON/rota/query → parâmetros) → [ActionFilters] → action → result
///
/// Para cada argumento da action que tenha um IValidator&lt;T&gt; registrado, executa o
/// FluentValidation. Se houver erros, a action NEM É CHAMADA e a resposta é 400 com
/// ValidationProblemDetails: { "errors": { "campo": ["mensagem"] } }.
/// Registrado em Api/DependencyInjection.cs (options.Filters.Add).
/// </summary>
internal sealed class FluentValidationActionFilter(
    IServiceProvider services,
    ProblemDetailsFactory problemDetailsFactory) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument is null)
            {
                continue;
            }

            // Monta o tipo IValidator<TipoDoArgumento> em tempo de execução e pede ao DI.
            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            if (services.GetService(validatorType) is not IValidator validator)
            {
                continue; // argumento sem validador (ex.: Guid id, CancellationToken)
            }

            var result = await validator.ValidateAsync(
                new ValidationContext<object>(argument),
                context.HttpContext.RequestAborted);

            foreach (var error in result.Errors)
            {
                // camelCase para bater com os nomes do JSON que o cliente enviou.
                context.ModelState.AddModelError(JsonNamingPolicy.CamelCase.ConvertName(error.PropertyName), error.ErrorMessage);
            }
        }

        if (!context.ModelState.IsValid)
        {
            var problem = problemDetailsFactory.CreateValidationProblemDetails(
                context.HttpContext,
                context.ModelState,
                StatusCodes.Status400BadRequest,
                title: "Há campos inválidos");

            // Definir context.Result "curto-circuita" o pipeline: a action não executa.
            context.Result = new BadRequestObjectResult(problem);
            return;
        }

        await next();
    }
}
