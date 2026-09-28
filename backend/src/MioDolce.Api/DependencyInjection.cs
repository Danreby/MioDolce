using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.Options;
using MioDolce.Api.Filters;
using MioDolce.Api.Infrastructure;

namespace MioDolce.Api;

internal static class DependencyInjection
{
    /// <summary>Serviços da camada HTTP: controllers, JSON, erros, documentação e CORS.</summary>
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {
        // AddControllers registra o MVC "só API" (sem Views/Razor). Os controllers são
        // descobertos automaticamente: toda classe pública que herda de ControllerBase.
        services
            .AddControllers(options =>
            {
                // Com Nullable habilitado, o MVC trataria toda string não anulável como [Required]
                // e responderia 400 em inglês ANTES do FluentValidation. Desligamos para que a
                // validação tenha um dono só (FluentValidation, com mensagens em português).
                options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;

                // Filtro global: vale para todas as actions de todos os controllers.
                options.Filters.Add<FluentValidationActionFilter>();
            })
            // Enums trafegam como texto ("Entry") em vez de número (0): contrato mais legível e estável.
            // ATENÇÃO: controllers usam as opções de JSON do MVC (AddJsonOptions), não as de
            // ConfigureHttpJsonOptions. São configurações separadas.
            .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()))
            // Quando o MODEL BINDING falha (JSON malformado, "page=abc", enum inexistente), o
            // [ApiController] responde 400 sozinho, antes da action e antes do nosso filtro.
            // InvalidModelStateResponseFactory personaliza essa resposta automática.
            .ConfigureApiBehaviorOptions(options => options.InvalidModelStateResponseFactory = context =>
            {
                var factory = context.HttpContext.RequestServices.GetRequiredService<ProblemDetailsFactory>();
                var problem = factory.CreateValidationProblemDetails(
                    context.HttpContext,
                    context.ModelState,
                    StatusCodes.Status400BadRequest,
                    title: "Requisição inválida",
                    detail: "Não foi possível ler os dados enviados. Confira o formato do JSON e dos parâmetros.");

                return new BadRequestObjectResult(problem);
            });

        // O gerador de OpenAPI lê as opções de JSON "HTTP": configuramos também para o
        // documento mostrar os enums como texto, igual ao que a API realmente envia.
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
            document.Info.Description = "API de gerenciamento de estoque. Projeto de estudo em ASP.NET Core.";
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
