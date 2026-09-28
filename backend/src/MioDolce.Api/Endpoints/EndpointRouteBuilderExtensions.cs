namespace MioDolce.Api.Endpoints;

internal static class EndpointRouteBuilderExtensions
{
    /// <summary>
    /// Agrupa todos os recursos sob /api. Cada recurso vive em seu próprio arquivo
    /// (CategoryEndpoints, ProductEndpoints...) — o equivalente a um Controller.
    /// </summary>
    public static IEndpointRouteBuilder MapApiEndpoints(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api");

        api.MapCategoryEndpoints();
        api.MapProductEndpoints();
        api.MapStockEndpoints();
        api.MapDashboardEndpoints();

        return app;
    }
}
