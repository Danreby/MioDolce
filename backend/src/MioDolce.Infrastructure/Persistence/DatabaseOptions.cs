namespace MioDolce.Infrastructure.Persistence;

/// <summary>
/// Options pattern: uma classe fortemente tipada ligada à seção "Database" do appsettings.
/// Em vez de espalhar configuration["Database:SeedSampleData"] pelo código,
/// injetamos IOptions&lt;DatabaseOptions&gt; onde for preciso.
/// </summary>
public sealed class DatabaseOptions
{
    public const string SectionName = "Database";

    /// <summary>Popula o banco com dados de exemplo quando as migrations são aplicadas.</summary>
    public bool SeedSampleData { get; init; }
}
