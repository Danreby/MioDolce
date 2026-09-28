using MioDolce.Api;
using MioDolce.Api.Endpoints;
using MioDolce.Api.Extensions;
using MioDolce.Application;
using MioDolce.Infrastructure;
using Scalar.AspNetCore;

// ─── 1. Registro de serviços (injeção de dependência) ──────────────────────────
// Cada camada sabe registrar o que é seu. A ordem aqui não importa.
var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApplication()
    .AddInfrastructure()
    .AddPresentation();

var app = builder.Build();

// ─── 2. Pipeline de middlewares ────────────────────────────────────────────────
// Aqui a ordem IMPORTA: cada requisição atravessa os middlewares de cima para baixo.
app.UseExceptionHandler();   // captura exceções não tratadas → ProblemDetails (500)
app.UseStatusCodePages();    // respostas vazias de erro (ex.: 405) também viram ProblemDetails

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();                 // /openapi/v1.json
    app.MapScalarApiReference();      // /scalar  → documentação interativa
    await app.ApplyMigrationsAsync(); // cria/atualiza o schema do banco automaticamente
}
else
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseCors();

// ─── 3. Endpoints ─────────────────────────────────────────────────────────────
app.MapHealthChecks("/health");
app.MapApiEndpoints();

await app.RunAsync();
