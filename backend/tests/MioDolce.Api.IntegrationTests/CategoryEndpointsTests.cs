using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using MioDolce.Api.IntegrationTests.Infrastructure;
using MioDolce.Application.Features.Categories;

namespace MioDolce.Api.IntegrationTests;

public sealed class CategoryEndpointsTests(ApiFactory factory)
{
    private readonly HttpClient _client = factory.CreateClient();

    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Create_ValidRequest_Returns201WithLocationHeader()
    {
        var name = ApiClientExtensions.Unique("Cat");

        var response = await _client.PostAsJsonAsync("/api/categories", new CategoryRequest(name, "desc"), ApiFactory.Json, Ct);

        var created = await response.ReadAsync<CategoryResponse>(HttpStatusCode.Created);
        Assert.Equal(name, created.Name);
        Assert.Equal($"/api/categories/{created.Id}", response.Headers.Location?.AbsolutePath);
    }

    [Fact]
    public async Task Create_BlankName_Returns400WithFieldError()
    {
        var response = await _client.PostAsJsonAsync("/api/categories", new CategoryRequest("", null), ApiFactory.Json, Ct);

        var problem = await response.ReadAsync<ValidationProblemDetails>(HttpStatusCode.BadRequest);
        Assert.Contains("name", problem.Errors.Keys);
    }

    [Fact]
    public async Task Create_DuplicateName_Returns409()
    {
        var existing = await _client.CreateCategoryAsync();

        var response = await _client.PostAsJsonAsync("/api/categories", new CategoryRequest(existing.Name, null), ApiFactory.Json, Ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Delete_CategoryWithProducts_Returns409()
    {
        var product = await _client.CreateProductAsync();

        var response = await _client.DeleteAsync($"/api/categories/{product.CategoryId}", Ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
