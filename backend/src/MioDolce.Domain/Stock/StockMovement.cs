using MioDolce.Domain.Common;
using MioDolce.Domain.Products;

namespace MioDolce.Domain.Stock;

/// <summary>
/// Registro imutável (livro-razão) de uma alteração de saldo.
/// Nunca é editado nem apagado: o saldo atual de um produto é sempre explicável
/// pela soma das suas movimentações.
/// </summary>
public sealed class StockMovement : Entity
{
    public const int NoteMaxLength = 200;

    private StockMovement()
    {
    }

    public Guid ProductId { get; private set; }

    public Product? Product { get; private set; }

    public MovementType Type { get; private set; }

    /// <summary>Variação com sinal: positiva aumenta o saldo, negativa reduz.</summary>
    public decimal Delta { get; private set; }

    /// <summary>Saldo do produto logo após esta movimentação (facilita auditoria).</summary>
    public decimal BalanceAfter { get; private set; }

    public string? Note { get; private set; }

    public DateTime OccurredAtUtc { get; private set; }

    // "internal": só o agregado Product (mesmo assembly) pode criar movimentações.
    internal static StockMovement Record(Product product, MovementType type, decimal delta, string? note, DateTime occurredAtUtc) => new()
    {
        ProductId = product.Id,
        Type = type,
        Delta = delta,
        BalanceAfter = product.QuantityOnHand,
        Note = Guard.OptionalText(note, NoteMaxLength),
        OccurredAtUtc = occurredAtUtc,
    };
}
