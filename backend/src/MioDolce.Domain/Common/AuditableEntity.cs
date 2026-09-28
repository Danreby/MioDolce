namespace MioDolce.Domain.Common;

/// <summary>
/// Entidade com trilha de auditoria e controle de concorrência.
/// Os valores são preenchidos automaticamente por um interceptor do EF Core
/// (veja Infrastructure/Persistence/Interceptors), então o domínio não precisa se preocupar com isso.
/// </summary>
public abstract class AuditableEntity : Entity
{
    public DateTime CreatedAtUtc { get; private set; }

    public DateTime? UpdatedAtUtc { get; private set; }

    /// <summary>
    /// Token de concorrência otimista: muda a cada UPDATE.
    /// Se duas requisições editarem o mesmo registro ao mesmo tempo, a segunda falha
    /// em vez de sobrescrever silenciosamente a primeira.
    /// </summary>
    public Guid ConcurrencyStamp { get; private set; }
}
