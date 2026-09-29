using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using MioDolce.Api.IntegrationTests.Infrastructure;
using MioDolce.Application.Common;
using MioDolce.Application.Features.Products;

namespace MioDolce.Api.IntegrationTests;

/// <summary>
/// Testes do código de barras: o recurso que veio com a migration AddBarcodeToProducts
/// (exemplo 2 de docs/06). O banco do teste é criado aplicando TODAS as migrations,
/// então estes testes também provam que a migration nova funciona no MySQL real.
/// </summary>
public sealed class ProductsControllerTests(ApiFactory factory)
{
    private readonly HttpClient _client = factory.CreateClient();

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Create_WithFormattedBarcode_StoresDigitsAndIsSearchable()
    {
        var digits = UniqueBarcode();
        var formatted = $"{digits[..3]} {digits[3..7]} {digits[7..12]}-{digits[12..]}";

        var product = await _client.CreateProductAsync(barcode: formatted);

        Assert.Equal(digits, product.Barcode);

        var search = await (await _client.GetAsync($"/api/products?search={digits}", Ct))
            .ReadAsync<PagedResponse<ProductResponse>>(HttpStatusCode.OK);
        Assert.Equal(product.Id, Assert.Single(search.Items).Id);
    }

    [Fact]
    public async Task Create_WithoutBarcode_IsAllowedManyTimes()
    {
        // Índice único em coluna anulável: vários NULL convivem sem conflito.
        var first = await _client.CreateProductAsync();
        var second = await _client.CreateProductAsync();

        Assert.Null(first.Barcode);
        Assert.Null(second.Barcode);
    }

    [Fact]
    public async Task Create_DuplicateBarcode_Returns409()
    {
        var barcode = UniqueBarcode();
        await _client.CreateProductAsync(barcode: barcode);

        var category = await _client.CreateCategoryAsync();
        var response = await _client.PostAsJsonAsync(
            "/api/products",
            NewRequest(category.Id, barcode),
            ApiFactory.Json,
            Ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Create_BarcodeWithWrongLength_Returns400()
    {
        var category = await _client.CreateCategoryAsync();

        var response = await _client.PostAsJsonAsync(
            "/api/products",
            NewRequest(category.Id, "12345"),
            ApiFactory.Json,
            Ct);

        var problem = await response.ReadAsync<ValidationProblemDetails>(HttpStatusCode.BadRequest);
        Assert.Contains("barcode", problem.Errors.Keys);
    }

    private static CreateProductRequest NewRequest(Guid categoryId, string? barcode) => new(
        ApiClientExtensions.Unique("SKU"),
        "Produto com código",
        null,
        barcode,
        categoryId,
        Domain.Products.UnitOfMeasure.Unit,
        UnitCost: 1m,
        MinimumStock: 0m,
        InitialQuantity: 0m);

    // 13 dígitos (formato EAN-13) aleatórios: os testes compartilham o banco e o código é único.
    private static string UniqueBarcode() =>
        string.Concat(Enumerable.Range(0, 13).Select(_ => Random.Shared.Next(0, 10)));
}
