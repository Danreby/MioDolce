using System.Globalization;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using MioDolce.Application.Features.Categories;
using MioDolce.Application.Features.Dashboard;
using MioDolce.Application.Features.Products;
using MioDolce.Application.Features.Stock;

namespace MioDolce.Application;

/// <summary>
/// Cada camada expõe UM método de extensão que registra seus próprios serviços.
/// O Program.cs só chama AddApplication()/AddInfrastructure(), sem conhecer os detalhes.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Mensagens padrão do FluentValidation em português.
        ValidatorOptions.Global.LanguageManager.Culture = CultureInfo.GetCultureInfo("pt-BR");

        // Registra todos os AbstractValidator<T> deste assembly como IValidator<T>.
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly, includeInternalTypes: true);

        // Scoped = uma instância por requisição HTTP (mesmo tempo de vida do DbContext).
        services.AddScoped<CategoryService>();
        services.AddScoped<ProductService>();
        services.AddScoped<StockService>();
        services.AddScoped<DashboardService>();

        return services;
    }
}
