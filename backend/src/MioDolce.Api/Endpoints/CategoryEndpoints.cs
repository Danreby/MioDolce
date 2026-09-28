using Microsoft.AspNetCore.Http.HttpResults;
using MioDolce.Api.Extensions;
using MioDolce.Api.Filters;
using MioDolce.Application.Features.Categories;

namespace MioDolce.Api.Endpoints;

/// <summary>
/// Minimal API organizada: o mapeamento das rotas fica no topo e cada handler é um
/// método estático com nome. Os tipos de retorno (Results&lt;...&gt;) documentam no próprio
/// código quais status HTTP o endpoint pode devolver — e alimentam o OpenAPI automaticamente.
/// </summary>
internal static class CategoryEndpoints
{
    private const string GetByIdRoute = "GetCategoryById";

    public static IEndpointRouteBuilder MapCategoryEndpoints(this IEndpointRouteBuilder api)
    {
        var group = api.MapGroup("/categories").WithTags("Categorias");

        group.MapGet("/", ListAsync)
            .WithSummary("Lista todas as categorias com a contagem de produtos");

        group.MapGet("/{id:guid}", GetByIdAsync)
            .WithName(GetByIdRoute)
            .WithSummary("Detalha uma categoria");

        group.MapPost("/", CreateAsync)
            .WithRequestValidation<CategoryRequest>()
            .WithSummary("Cria uma categoria");

        group.MapPut("/{id:guid}", UpdateAsync)
            .WithRequestValidation<CategoryRequest>()
            .WithSummary("Renomeia/edita uma categoria");

        group.MapDelete("/{id:guid}", DeleteAsync)
            .WithSummary("Exclui uma categoria sem produtos");

        return api;
    }

    // Os parâmetros são resolvidos automaticamente: "id" vem da rota, "request" do corpo JSON,
    // "service" do contêiner de DI e o CancellationToken é cancelado se o cliente desistir.
    private static async Task<Ok<IReadOnlyList<CategoryResponse>>> ListAsync(
        CategoryService service,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await service.ListAsync(cancellationToken));

    private static async Task<Results<Ok<CategoryResponse>, ProblemHttpResult>> GetByIdAsync(
        Guid id,
        CategoryService service,
        CancellationToken cancellationToken)
    {
        var result = await service.GetAsync(id, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }

    private static async Task<Results<CreatedAtRoute<CategoryResponse>, ProblemHttpResult>> CreateAsync(
        CategoryRequest request,
        CategoryService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(request, cancellationToken);

        // 201 Created + cabeçalho Location apontando para GET /api/categories/{id}.
        return result.IsSuccess
            ? TypedResults.CreatedAtRoute(result.Value, GetByIdRoute, new { id = result.Value.Id })
            : result.ToProblem();
    }

    private static async Task<Results<Ok<CategoryResponse>, ProblemHttpResult>> UpdateAsync(
        Guid id,
        CategoryRequest request,
        CategoryService service,
        CancellationToken cancellationToken)
    {
        var result = await service.UpdateAsync(id, request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> DeleteAsync(
        Guid id,
        CategoryService service,
        CancellationToken cancellationToken)
    {
        var result = await service.DeleteAsync(id, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
