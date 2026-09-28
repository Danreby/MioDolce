using System.Net;
using System.Net.Http.Json;
using MioDolce.Api.IntegrationTests.Infrastructure;
using MioDolce.Application.Common;
using MioDolce.Application.Features.Products;
using MioDolce.Application.Features.Stock;
using MioDolce.Domain.Stock;

namespace MioDolce.Api.IntegrationTests;

public sealed class StockMovementsControllerTests(ApiFactory factory)
{
    private readonly HttpClient _client = factory.CreateClient();

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task CreateProduct_WithInitialQuantity_RecordsInitialEntry()
    {
        var product = await _client.CreateProductAsync(initialQuantity: 12);

        var movements = await GetMovementsAsync(product.Id);

        var entry = Assert.Single(movements.Items);
        Assert.Equal(MovementType.Entry, entry.Type);
        Assert.Equal(12, entry.Delta);
        Assert.Equal(12, product.QuantityOnHand);
    }

    [Fact]
    public async Task Exit_BeyondBalance_Returns422AndKeepsBalance()
    {
        var product = await _client.CreateProductAsync(initialQuantity: 3);

        var response = await RegisterAsync(product.Id, MovementType.Exit, 5);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Equal(3, (await GetProductAsync(product.Id)).QuantityOnHand);
    }

    [Fact]
    public async Task Delete_ProductWithHistory_Returns409()
    {
        var product = await _client.CreateProductAsync(initialQuantity: 1);

        var response = await _client.DeleteAsync($"/api/products/{product.Id}", Ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    /// <summary>
    /// Teste de regressão de um bug real encontrado neste projeto: sem transação explícita,
    /// uma saída rejeitada por concorrência deixava a movimentação gravada.
    /// Invariante: o saldo NUNCA fica negativo e é SEMPRE igual à soma do livro-razão.
    /// </summary>
    [Fact]
    public async Task ConcurrentExits_NeverOversell_AndLedgerMatchesBalance()
    {
        var product = await _client.CreateProductAsync(initialQuantity: 10);

        var responses = await Task.WhenAll(
            Enumerable.Range(0, 20).Select(_ => RegisterAsync(product.Id, MovementType.Exit, 1)));

        var accepted = responses.Count(r => r.StatusCode == HttpStatusCode.Created);
        var current = await GetProductAsync(product.Id);
        var ledger = await GetMovementsAsync(product.Id);

        Assert.All(responses, r => Assert.Contains(
            r.StatusCode,
            new[] { HttpStatusCode.Created, HttpStatusCode.Conflict, HttpStatusCode.UnprocessableEntity }));
        Assert.InRange(accepted, 1, 10);
        Assert.Equal(10 - accepted, current.QuantityOnHand);
        Assert.Equal(current.QuantityOnHand, ledger.Items.Sum(m => m.Delta));
        Assert.Equal(accepted + 1, ledger.TotalCount); // +1 = saldo inicial
    }

    private Task<HttpResponseMessage> RegisterAsync(Guid productId, MovementType type, decimal quantity) =>
        _client.PostAsJsonAsync(
            $"/api/products/{productId}/movements",
            new RegisterMovementRequest(type, quantity, null),
            ApiFactory.Json,
            Ct);

    private async Task<ProductResponse> GetProductAsync(Guid id) =>
        await (await _client.GetAsync($"/api/products/{id}", Ct)).ReadAsync<ProductResponse>(HttpStatusCode.OK);

    private async Task<PagedResponse<StockMovementResponse>> GetMovementsAsync(Guid productId) =>
        await (await _client.GetAsync($"/api/movements?productId={productId}&pageSize=100", Ct))
            .ReadAsync<PagedResponse<StockMovementResponse>>(HttpStatusCode.OK);
}
