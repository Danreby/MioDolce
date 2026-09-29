using System.Globalization;
using MioDolce.Domain.Common;

namespace MioDolce.Domain.Products;

/// <summary>
/// Catálogo de erros do agregado Produto. Centralizar evita strings espalhadas
/// e dá a cada erro um código estável que o front-end pode usar.
/// </summary>
public static class ProductErrors
{
    private static readonly CultureInfo PtBr = CultureInfo.GetCultureInfo("pt-BR");

    public static readonly Error Inactive = Error.BusinessRule(
        "Product.Inactive",
        "Produto arquivado não pode receber movimentações. Reative-o primeiro.");

    public static readonly Error QuantityMustBePositive = Error.Validation(
        "Product.QuantityMustBePositive",
        "A quantidade deve ser maior que zero.");

    public static readonly Error AdjustmentWithoutChange = Error.BusinessRule(
        "Product.AdjustmentWithoutChange",
        "A contagem informada é igual ao saldo atual; não há o que ajustar.");

    public static readonly Error SkuAlreadyExists = Error.Conflict(
        "Product.SkuAlreadyExists",
        "Já existe um produto com esse SKU.");

    public static readonly Error BarcodeAlreadyExists = Error.Conflict(
        "Product.BarcodeAlreadyExists",
        "Já existe um produto com esse código de barras.");

    public static readonly Error CategoryDoesNotExist = Error.Validation(
        "Product.CategoryDoesNotExist",
        "A categoria informada não existe.");

    public static readonly Error HasMovements = Error.Conflict(
        "Product.HasMovements",
        "O produto possui histórico de movimentações e não pode ser excluído. Arquive-o em vez disso.");

    public static Error NotFound(Guid id) => Error.NotFound(
        "Product.NotFound",
        $"Produto '{id}' não encontrado.");

    public static Error InsufficientStock(decimal available, decimal requested) => Error.BusinessRule(
        "Product.InsufficientStock",
        string.Create(PtBr, $"Estoque insuficiente: disponível {available:0.###}, solicitado {requested:0.###}."));
}
