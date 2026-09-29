using MioDolce.Domain.Products;
using MioDolce.Domain.Stock;

namespace MioDolce.Domain.Tests.Products;

/// <summary>
/// Testes de unidade do agregado Product. Padrão AAA: Arrange (prepara), Act (executa), Assert (verifica).
/// Nome dos testes: Metodo_Cenario_ResultadoEsperado.
/// </summary>
public sealed class ProductTests
{
    private static readonly DateTime Now = new(2026, 9, 1, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Create_NormalizesSkuToUpperCaseAndStartsWithZeroBalance()
    {
        var product = NewProduct(sku: "  cho-70 ");

        Assert.Equal("CHO-70", product.Sku);
        Assert.Equal(0, product.QuantityOnHand);
        Assert.True(product.IsActive);
    }

    [Fact]
    public void Create_WithEmptyCategory_Throws()
    {
        Assert.Throws<ArgumentException>(() =>
            Product.Create("SKU", "Nome", null, null, Guid.Empty, UnitOfMeasure.Unit, 1, 1));
    }

    [Theory]
    [InlineData("789 1234 56789-0", "7891234567890")]
    [InlineData("  ", null)]
    [InlineData(null, null)]
    public void NormalizeBarcode_KeepsOnlyDigits(string? input, string? expected)
    {
        Assert.Equal(expected, Product.NormalizeBarcode(input));
    }

    [Fact]
    public void Create_WithBarcodeOfWrongLength_Throws()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            Product.Create("SKU", "Nome", null, "12345", Guid.CreateVersion7(), UnitOfMeasure.Unit, 1, 1));
    }

    [Fact]
    public void RegisterMovement_Entry_IncreasesBalanceAndRecordsLedger()
    {
        var product = NewProduct();

        var result = product.RegisterMovement(MovementType.Entry, 10.5m, "Compra", Now);

        Assert.True(result.IsSuccess);
        Assert.Equal(10.5m, product.QuantityOnHand);
        Assert.Equal(10.5m, result.Value.Delta);
        Assert.Equal(10.5m, result.Value.BalanceAfter);
        Assert.Equal(product.Id, result.Value.ProductId);
    }

    [Fact]
    public void RegisterMovement_ExitWithinBalance_RecordsNegativeDelta()
    {
        var product = NewProductWithBalance(10);

        var result = product.RegisterMovement(MovementType.Exit, 4, null, Now);

        Assert.True(result.IsSuccess);
        Assert.Equal(6, product.QuantityOnHand);
        Assert.Equal(-4, result.Value.Delta);
    }

    [Fact]
    public void RegisterMovement_ExitBeyondBalance_FailsAndKeepsBalance()
    {
        var product = NewProductWithBalance(3);

        var result = product.RegisterMovement(MovementType.Exit, 5, null, Now);

        Assert.True(result.IsFailure);
        Assert.Equal("Product.InsufficientStock", result.Error.Code);
        Assert.Equal(3, product.QuantityOnHand);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void RegisterMovement_EntryWithNonPositiveQuantity_Fails(decimal quantity)
    {
        var product = NewProduct();

        var result = product.RegisterMovement(MovementType.Entry, quantity, null, Now);

        Assert.Equal(ProductErrors.QuantityMustBePositive, result.Error);
    }

    [Fact]
    public void RegisterMovement_Adjustment_SetsCountedBalanceAndStoresDifference()
    {
        var product = NewProductWithBalance(10);

        var result = product.RegisterMovement(MovementType.Adjustment, 7.25m, "Inventário", Now);

        Assert.True(result.IsSuccess);
        Assert.Equal(7.25m, product.QuantityOnHand);
        Assert.Equal(-2.75m, result.Value.Delta);
    }

    [Fact]
    public void RegisterMovement_AdjustmentToSameBalance_Fails()
    {
        var product = NewProductWithBalance(5);

        var result = product.RegisterMovement(MovementType.Adjustment, 5, null, Now);

        Assert.Equal(ProductErrors.AdjustmentWithoutChange, result.Error);
    }

    [Fact]
    public void RegisterMovement_OnArchivedProduct_Fails()
    {
        var product = NewProductWithBalance(5);
        product.Archive();

        var result = product.RegisterMovement(MovementType.Exit, 1, null, Now);

        Assert.Equal(ProductErrors.Inactive, result.Error);
        Assert.Equal(5, product.QuantityOnHand);
    }

    [Theory]
    [InlineData(0, 5, StockStatus.OutOfStock)]
    [InlineData(5, 5, StockStatus.Low)]
    [InlineData(2, 5, StockStatus.Low)]
    [InlineData(6, 5, StockStatus.Ok)]
    [InlineData(1, 0, StockStatus.Ok)]
    public void ResolveStatus_ComparesBalanceWithMinimum(decimal balance, decimal minimum, StockStatus expected)
    {
        Assert.Equal(expected, Product.ResolveStatus(balance, minimum));
    }

    private static Product NewProduct(string sku = "SKU-1") =>
        Product.Create(sku, "Chocolate 70%", null, null, Guid.CreateVersion7(), UnitOfMeasure.Kilogram, 90m, 5m);

    private static Product NewProductWithBalance(decimal balance)
    {
        var product = NewProduct();
        product.RegisterMovement(MovementType.Entry, balance, null, Now);
        return product;
    }
}
