using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using MioDolce.Application.Abstractions;
using MioDolce.Infrastructure.Persistence;
using MioDolce.Infrastructure.Persistence.Interceptors;
using MioDolce.Infrastructure.Persistence.Seed;

namespace MioDolce.Infrastructure;

public static class DependencyInjection
{
    public const string ConnectionStringName = "MioDolce";

    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        // TimeProvider (.NET 8+) substitui DateTime.UtcNow: nos testes dá para "congelar" o relógio.
        services.TryAddSingleton(TimeProvider.System);

        services.AddOptions<DatabaseOptions>()
            .BindConfiguration(DatabaseOptions.SectionName)
            .ValidateOnStart();

        services.AddSingleton<AuditableEntityInterceptor>();

        services.AddDbContext<AppDbContext>((serviceProvider, options) =>
        {
            // Lido de forma "preguiçosa" (quando o DbContext é criado) para que testes
            // e variáveis de ambiente consigam sobrescrever a connection string.
            var configuration = serviceProvider.GetRequiredService<IConfiguration>();
            var connectionString = configuration.GetConnectionString(ConnectionStringName)
                ?? throw new InvalidOperationException(
                    $"Connection string '{ConnectionStringName}' não configurada. Veja backend/README.md.");

            options
                .UseMySQL(connectionString)
                .AddInterceptors(serviceProvider.GetRequiredService<AuditableEntityInterceptor>());

            var database = serviceProvider.GetRequiredService<IOptions<DatabaseOptions>>().Value;
            if (database.SeedSampleData)
            {
                var timeProvider = serviceProvider.GetRequiredService<TimeProvider>();
                options
                    .UseSeeding((context, _) => InventorySeeder.Seed(context, timeProvider))
                    .UseAsyncSeeding((context, _, ct) => InventorySeeder.SeedAsync(context, timeProvider, ct));
            }
        });

        // A Application pede IApplicationDbContext; entregamos a MESMA instância scoped do AppDbContext.
        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        services.AddHealthChecks().AddDbContextCheck<AppDbContext>("database");

        return services;
    }
}
