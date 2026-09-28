namespace MioDolce.Domain.Products;

/// <summary>Situação do saldo em relação ao estoque mínimo.</summary>
public enum StockStatus
{
    Ok,
    Low,
    OutOfStock,
}
