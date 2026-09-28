using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.Extensions.Options;
using MioDolce.Api.Infrastructure;

namespace MioDolce.Api;

internal static class DependencyInjection
{
    /// <summary>Serviços da camada HTTP: JSON, erros, documentação e CORS.</summary>
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {
        // Enums trafegam como texto ("Entry") em vez de número (0): contrato mais legível e estável.
        services.ConfigureHttpJsonOptions(options =>
            options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

        // ProblemDetails (RFC 9457): formato padrão de erro para TODAS as respostas de falha.
        services.AddProblemDetails(options =>
            options.CustomizeProblemDetails = context =>
            {
                context.ProblemDetails.Instance = $"{context.HttpContext.Request.Method} {context.HttpContext.Request.Path}";
                context.ProblemDetails.Extensions.TryAdd("traceId", context.HttpContext.TraceIdentifier);
            });

        services.AddExceptionHandler<GlobalExceptionHandler>();

        // OpenAPI nativo do ASP.NET Core (.NET 9+). O Scalar só desenha a UI em cima dele.
        services.AddOpenApi(options => options.AddDocumentTransformer((document, _, _) =>
        {
            document.Info.Title = "MioDolce API";
            document.Info.Description = "API de gerenciamento de estoque — projeto de estudo em ASP.NET Core.";
            return Task.CompletedTask;
        }));

        // CORS lido do appsettings via Options pattern, com validação na inicialização.
        services.AddOptions<FrontendOptions>()
            .BindConfiguration(FrontendOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddCors();
        services.AddOptions<CorsOptions>()
            .Configure<IOptions<FrontendOptions>>((cors, frontend) =>
                cors.AddDefaultPolicy(policy => policy
                    .WithOrigins(frontend.Value.AllowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()));

        return services;
    }
}
