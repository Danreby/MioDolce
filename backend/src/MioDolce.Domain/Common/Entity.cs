namespace MioDolce.Domain.Common;

/// <summary>
/// Classe base de toda entidade: algo que tem identidade própria.
/// Usamos Guid versão 7 (ordenado pelo tempo), que evita a fragmentação de índice
/// que um Guid aleatório (v4) causaria no MySQL.
/// </summary>
public abstract class Entity
{
    public Guid Id { get; private init; } = Guid.CreateVersion7();
}
