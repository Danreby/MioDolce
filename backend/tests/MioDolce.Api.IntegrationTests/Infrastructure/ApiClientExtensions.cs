using System.Net;
using System.Net.Http.Json;
using MioDolce.Application.Features.Categories;
using MioDolce.Application.Features.Products;
using MioDolce.Domain.Products;

namespace MioDolce.Api.IntegrationTests.Infrastructure;

/// <summary>Atalhos para montar o cenário (Arrange) dos testes via HTTP.</summary>
internal static class ApiClientExtensions
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    // Nomes/SKUs únicos: os testes compartilham o banco e não podem colidir entre si.
    public static string Unique(string prefix) => $"{prefix}-{Guid.NewGuid():N}"[..20].ToUpperInvariant();

    public static async Task<CategoryResponse> CreateCategoryAsync(this HttpClient client)
    {
        var response = await client.PostAsJsonAsync("/api/categories", new CategoryRequest(Unique("Cat"), null), ApiFactory.Json, Ct);
        return await response.ReadAsync<CategoryResponse>(HttpStatusCode.Created);
    }

    public static async Task<ProductResponse> CreateProductAsync(this HttpClient client, decimal initialQuantity = 0, string? barcode = null)
    {
        var category = await client.CreateCategoryAsync();
        var request = new CreateProductRequest(
            Unique("SKU"),
            "Produto de teste",
            null,
            barcode,
            category.Id,
            UnitOfMeasure.Unit,
            UnitCost: 10m,
            MinimumStock: 2m,
            initialQuantity);

        var response = await client.PostAsJsonAsync("/api/products", request, ApiFactory.Json, Ct);
        return await response.ReadAsync<ProductResponse>(HttpStatusCode.Created);
    }

    public static async Task<T> ReadAsync<T>(this HttpResponseMessage response, HttpStatusCode expected)
    {
        Assert.Equal(expected, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<T>(ApiFactory.Json, Ct);
        Assert.NotNull(body);
        return body;
    }
}
