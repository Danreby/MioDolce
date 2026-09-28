using Microsoft.AspNetCore.Mvc;
using MioDolce.Application.Features.Dashboard;

namespace MioDolce.Api.Controllers;

[Route("api/dashboard")]
[Tags("Painel")]
public sealed class DashboardController(DashboardService service) : ApiControllerBase
{
    [HttpGet]
    [EndpointSummary("Indicadores gerais do estoque")]
    [ProducesResponseType<DashboardResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardResponse>> Get(CancellationToken cancellationToken) =>
        Ok(await service.GetAsync(cancellationToken));
}
