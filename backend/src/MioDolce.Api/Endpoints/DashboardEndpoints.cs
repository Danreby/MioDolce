using Microsoft.AspNetCore.Http.HttpResults;
using MioDolce.Application.Features.Dashboard;

namespace MioDolce.Api.Endpoints;

internal static class DashboardEndpoints
{
    public static IEndpointRouteBuilder MapDashboardEndpoints(this IEndpointRouteBuilder api)
    {
        api.MapGet("/dashboard", GetAsync)
            .WithTags("Painel")
            .WithSummary("Indicadores gerais do estoque");

        return api;
    }

    private static async Task<Ok<DashboardResponse>> GetAsync(DashboardService service, CancellationToken cancellationToken) =>
        TypedResults.Ok(await service.GetAsync(cancellationToken));
}
