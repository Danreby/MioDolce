using MioDolce.Domain.Categories;
using MioDolce.Domain.Common;
using MioDolce.Domain.Stock;

namespace MioDolce.Domain.Products;

/// <summary>
/// Raiz de agregado "Produto".
/// Regra central do sistema: o saldo (QuantityOnHand) NUNCA é alterado diretamente.
/// Toda mudança passa por RegisterMovement, que valida a regra e gera o registro no livro-razão.
/// </summary>
public sealed class Product : AuditableEntity
{
    public const int SkuMaxLength = 32;
    public const int NameMaxLength = 120;
    public const int DescriptionMaxLength = 500;

    private Product()
    {
    }

    /// <summary>Código único do produto (Stock Keeping Unit). Imutável após a criação.</summary>
    public string Sku { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public Guid CategoryId { get; private set; }

    public Category? Category { get; private set; }

    public UnitOfMeasure Unit { get; private set; }

    /// <summary>Custo por unidade de medida, usado para valorizar o estoque.</summary>
    public decimal UnitCost { get; private set; }

    public decimal QuantityOnHand { get; private set; }

    /// <summary>Abaixo (ou igual) a este saldo o produto entra em alerta.</summary>
    public decimal MinimumStock { get; private set; }

    public bool IsActive { get; private set; } = true;

    // Propriedades só com get não são mapeadas pelo EF Core: são calculadas em memória.
    public StockStatus Status => ResolveStatus(QuantityOnHand, MinimumStock);

    public static Product Create(
        string sku,
        string name,
        string? description,
        Guid categoryId,
        UnitOfMeasure unit,
        decimal unitCost,
        decimal minimumStock)
    {
        var product = new Product
        {
            Sku = Guard.Text(sku, SkuMaxLength).ToUpperInvariant(),
        };

        product.UpdateDetails(name, description, categoryId, unit, unitCost, minimumStock);
        return product;
    }

    public static StockStatus ResolveStatus(decimal quantityOnHand, decimal minimumStock) =>
        quantityOnHand <= 0 ? StockStatus.OutOfStock
        : quantityOnHand <= minimumStock ? StockStatus.Low
        : StockStatus.Ok;

    public void UpdateDetails(
        string name,
        string? description,
        Guid categoryId,
        UnitOfMeasure unit,
        decimal unitCost,
        decimal minimumStock)
    {
        if (categoryId == Guid.Empty)
        {
            throw new ArgumentException("A categoria é obrigatória.", nameof(categoryId));
        }

        Name = Guard.Text(name, NameMaxLength);
        Description = Guard.OptionalText(description, DescriptionMaxLength);
        CategoryId = categoryId;
        Unit = unit;
        UnitCost = Guard.NotNegative(unitCost);
        MinimumStock = Guard.NotNegative(minimumStock);
    }

    public void Archive() => IsActive = false;

    public void Reactivate() => IsActive = true;

    /// <summary>
    /// Ponto único de alteração de saldo.
    /// Para Entrada/Saída, <paramref name="quantity"/> é a quantidade movimentada.
    /// Para Ajuste, é o saldo CONTADO fisicamente (o sistema calcula a diferença).
    /// </summary>
    public Result<StockMovement> RegisterMovement(MovementType type, decimal quantity, string? note, DateTime occurredAtUtc)
    {
        if (!IsActive)
        {
            return ProductErrors.Inactive;
        }

        return type switch
        {
            MovementType.Entry => Entry(quantity, note, occurredAtUtc),
            MovementType.Exit => Exit(quantity, note, occurredAtUtc),
            MovementType.Adjustment => AdjustTo(quantity, note, occurredAtUtc),
            _ => throw new ArgumentOutOfRangeException(nameof(type), type, "Tipo de movimentação desconhecido."),
        };
    }

    private Result<StockMovement> Entry(decimal quantity, string? note, DateTime occurredAtUtc)
    {
        if (quantity <= 0)
        {
            return ProductErrors.QuantityMustBePositive;
        }

        return Apply(MovementType.Entry, quantity, note, occurredAtUtc);
    }

    private Result<StockMovement> Exit(decimal quantity, string? note, DateTime occurredAtUtc)
    {
        if (quantity <= 0)
        {
            return ProductErrors.QuantityMustBePositive;
        }

        if (quantity > QuantityOnHand)
        {
            return ProductErrors.InsufficientStock(QuantityOnHand, quantity);
        }

        return Apply(MovementType.Exit, -quantity, note, occurredAtUtc);
    }

    private Result<StockMovement> AdjustTo(decimal countedQuantity, string? note, DateTime occurredAtUtc)
    {
        if (countedQuantity < 0)
        {
            return ProductErrors.QuantityMustBePositive;
        }

        var delta = countedQuantity - QuantityOnHand;
        if (delta == 0)
        {
            return ProductErrors.AdjustmentWithoutChange;
        }

        return Apply(MovementType.Adjustment, delta, note, occurredAtUtc);
    }

    private StockMovement Apply(MovementType type, decimal delta, string? note, DateTime occurredAtUtc)
    {
        QuantityOnHand += delta;
        return StockMovement.Record(this, type, delta, note, occurredAtUtc);
    }
}
