using Microsoft.AspNetCore.Http.HttpResults;
using MioDolce.Api.Extensions;
using MioDolce.Api.Filters;
using MioDolce.Application.Common;
using MioDolce.Application.Features.Products;

namespace MioDolce.Api.Endpoints;

internal static class ProductEndpoints
{
    private const string GetByIdRoute = "GetProductById";

    public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder api)
    {
        var group = api.MapGroup("/products").WithTags("Produtos");

        group.MapGet("/", ListAsync)
            .WithRequestValidation<ProductListQuery>()
            .WithSummary("Lista produtos com busca, filtros, ordenação e paginação");

        group.MapGet("/{id:guid}", GetByIdAsync)
            .WithName(GetByIdRoute)
            .WithSummary("Detalha um produto");

        group.MapPost("/", CreateAsync)
            .WithRequestValidation<CreateProductRequest>()
            .WithSummary("Cadastra um produto (opcionalmente com saldo inicial)");

        group.MapPut("/{id:guid}", UpdateAsync)
            .WithRequestValidation<UpdateProductRequest>()
            .WithSummary("Edita os dados cadastrais (o saldo só muda por movimentação)");

        group.MapDelete("/{id:guid}", DeleteAsync)
            .WithSummary("Exclui um produto que nunca foi movimentado");

        return api;
    }

    // [AsParameters] transforma as propriedades do record em parâmetros de query string.
    private static async Task<Ok<PagedResponse<ProductResponse>>> ListAsync(
        [AsParameters] ProductListQuery query,
        ProductService service,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await service.ListAsync(query, cancellationToken));

    private static async Task<Results<Ok<ProductResponse>, ProblemHttpResult>> GetByIdAsync(
        Guid id,
        ProductService service,
        CancellationToken cancellationToken)
    {
        var result = await service.GetAsync(id, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }

    private static async Task<Results<CreatedAtRoute<ProductResponse>, ProblemHttpResult>> CreateAsync(
        CreateProductRequest request,
        ProductService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(request, cancellationToken);
        return result.IsSuccess
            ? TypedResults.CreatedAtRoute(result.Value, GetByIdRoute, new { id = result.Value.Id })
            : result.ToProblem();
    }

    private static async Task<Results<Ok<ProductResponse>, ProblemHttpResult>> UpdateAsync(
        Guid id,
        UpdateProductRequest request,
        ProductService service,
        CancellationToken cancellationToken)
    {
        var result = await service.UpdateAsync(id, request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.ToProblem();
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> DeleteAsync(
        Guid id,
        ProductService service,
        CancellationToken cancellationToken)
    {
        var result = await service.DeleteAsync(id, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.ToProblem();
    }
}
