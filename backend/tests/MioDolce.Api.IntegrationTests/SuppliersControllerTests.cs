using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using MioDolce.Api.IntegrationTests.Infrastructure;
using MioDolce.Application.Features.Suppliers;

namespace MioDolce.Api.IntegrationTests;

/// <summary>
/// PASSO 10 do guia docs/06: testar o recurso novo de ponta a ponta
/// (HTTP → controller → serviço → EF Core → MySQL real e de volta).
/// </summary>
public sealed class SuppliersControllerTests(ApiFactory factory)
{
    private readonly HttpClient _client = factory.CreateClient();

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Create_WithFormattedTaxId_StoresOnlyDigitsAndReturns201()
    {
        var taxId = UniqueTaxId();
        var formatted = $"{taxId[..2]}.{taxId[2..5]}.{taxId[5..8]}/{taxId[8..12]}-{taxId[12..]}";

        var response = await _client.PostAsJsonAsync(
            "/api/suppliers",
            new SupplierRequest("Cacau do Sul Ltda", formatted, "VENDAS@CACAUDOSUL.COM.BR", null),
            ApiFactory.Json,
            Ct);

        var created = await response.ReadAsync<SupplierResponse>(HttpStatusCode.Created);
        Assert.Equal(taxId, created.TaxId);
        Assert.Equal("vendas@cacaudosul.com.br", created.Email);
        Assert.Equal($"/api/suppliers/{created.Id}", response.Headers.Location?.AbsolutePath);
    }

    [Fact]
    public async Task Create_InvalidTaxIdAndEmail_Returns400WithFieldErrors()
    {
        var response = await _client.PostAsJsonAsync(
            "/api/suppliers",
            new SupplierRequest("", "123", "nao-e-email", null),
            ApiFactory.Json,
            Ct);

        var problem = await response.ReadAsync<ValidationProblemDetails>(HttpStatusCode.BadRequest);
        Assert.Contains("name", problem.Errors.Keys);
        Assert.Contains("taxId", problem.Errors.Keys);
        Assert.Contains("email", problem.Errors.Keys);
    }

    [Fact]
    public async Task Create_DuplicateTaxId_Returns409()
    {
        var taxId = UniqueTaxId();
        var first = await _client.PostAsJsonAsync("/api/suppliers", new SupplierRequest("Primeiro", taxId, null, null), ApiFactory.Json, Ct);
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);

        var second = await _client.PostAsJsonAsync("/api/suppliers", new SupplierRequest("Segundo", taxId, null, null), ApiFactory.Json, Ct);

        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task Update_ThenDelete_ThenGet_Returns404()
    {
        var created = await (await _client.PostAsJsonAsync(
                "/api/suppliers", new SupplierRequest("Embalagens Aurora", UniqueTaxId(), null, null), ApiFactory.Json, Ct))
            .ReadAsync<SupplierResponse>(HttpStatusCode.Created);

        var updated = await (await _client.PutAsJsonAsync(
                $"/api/suppliers/{created.Id}", new SupplierRequest("Embalagens Aurora ME", created.TaxId, null, "(11) 4002-8922"), ApiFactory.Json, Ct))
            .ReadAsync<SupplierResponse>(HttpStatusCode.OK);
        Assert.Equal("Embalagens Aurora ME", updated.Name);
        Assert.NotNull(updated.UpdatedAtUtc);

        var deleted = await _client.DeleteAsync($"/api/suppliers/{created.Id}", Ct);
        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);

        var afterDelete = await _client.GetAsync($"/api/suppliers/{created.Id}", Ct);
        Assert.Equal(HttpStatusCode.NotFound, afterDelete.StatusCode);
    }

    // 14 dígitos aleatórios: os testes compartilham o banco e o CNPJ é único.
    private static string UniqueTaxId() =>
        string.Concat(Enumerable.Range(0, 14).Select(_ => Random.Shared.Next(0, 10)));
}
