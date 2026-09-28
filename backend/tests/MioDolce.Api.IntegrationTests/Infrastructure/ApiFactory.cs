using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Testcontainers.MySql;

[assembly: AssemblyFixture(typeof(MioDolce.Api.IntegrationTests.Infrastructure.ApiFactory))]

namespace MioDolce.Api.IntegrationTests.Infrastructure;

/// <summary>
/// Sobe a API inteira em memória (WebApplicationFactory) apontando para um MySQL
/// descartável em container (Testcontainers). Testamos o mesmo banco usado em produção,
/// e não um substituto como SQLite/InMemory, que se comportam diferente.
///
/// É um "assembly fixture" (xUnit v3): criado uma vez e compartilhado por todos os testes.
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };

    private readonly MySqlContainer _mysql = new MySqlBuilder("mysql:8.4").Build();

    public async ValueTask InitializeAsync() => await _mysql.StartAsync();

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();
        await _mysql.DisposeAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Ambiente Development: a API aplica as migrations sozinha ao subir.
        builder.UseEnvironment("Development");
        builder.UseSetting("ConnectionStrings:MioDolce", _mysql.GetConnectionString());
        builder.UseSetting("Database:SeedSampleData", "false");
    }
}
