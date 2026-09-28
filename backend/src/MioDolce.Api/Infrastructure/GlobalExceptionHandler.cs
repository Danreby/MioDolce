using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace MioDolce.Api.Infrastructure;

/// <summary>
/// Rede de segurança para o que é INESPERADO. Erros de negócio não chegam aqui:
/// eles viajam como Result e são convertidos em ProblemDetails nos controllers.
/// Nunca devolvemos detalhes internos (stack trace, SQL) ao cliente num erro 500.
/// </summary>
internal sealed partial class GlobalExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var problem = exception switch
        {
            // Ex.: corpo acima do limite de tamanho. (JSON malformado em controllers é tratado
            // antes, pelo [ApiController]; veja InvalidModelStateResponseFactory.)
            BadHttpRequestException badRequest => new ProblemDetails
            {
                Status = badRequest.StatusCode,
                Title = "Requisição inválida",
                Detail = badRequest.Message,
            },
            _ => new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Erro interno",
                Detail = "Ocorreu um erro inesperado. Tente novamente em instantes.",
            },
        };

        if (problem.Status >= StatusCodes.Status500InternalServerError)
        {
            LogUnhandledException(exception, httpContext.Request.Method, httpContext.Request.Path);
        }

        httpContext.Response.StatusCode = problem.Status!.Value;

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = problem,
        });
    }

    [LoggerMessage(Level = LogLevel.Error, Message = "Erro não tratado em {Method} {Path}")]
    private partial void LogUnhandledException(Exception exception, string method, PathString path);
}
