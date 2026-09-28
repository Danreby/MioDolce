namespace MioDolce.Domain.Stock;

/// <summary>Tipo de movimentação de estoque.</summary>
public enum MovementType
{
    /// <summary>Entrada: compra, produção, devolução.</summary>
    Entry,

    /// <summary>Saída: venda, consumo, perda.</summary>
    Exit,

    /// <summary>Ajuste: correção após contagem física (inventário).</summary>
    Adjustment,
}
