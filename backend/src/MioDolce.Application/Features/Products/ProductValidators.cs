using FluentValidation;
using MioDolce.Application.Common;
using MioDolce.Domain.Products;

namespace MioDolce.Application.Features.Products;

/// <summary>Regras dos campos comuns à criação e à edição (reaproveitadas via Include).</summary>
internal sealed class ProductDetailsValidator : AbstractValidator<IProductDetails>
{
    public ProductDetailsValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(Product.NameMaxLength).WithName("Nome");
        RuleFor(x => x.Description).MaximumLength(Product.DescriptionMaxLength).WithName("Descrição");
        // Opcional: só valida quando veio preenchido. Aceita espaços e hífens ("789 1234-56789").
        RuleFor(x => x.Barcode)
            .Must(barcode => Product.NormalizeBarcode(barcode)?.Length is >= Product.BarcodeMinLength and <= Product.BarcodeMaxLength)
            .When(x => !string.IsNullOrWhiteSpace(x.Barcode))
            .WithMessage($"O código de barras deve ter de {Product.BarcodeMinLength} a {Product.BarcodeMaxLength} dígitos.")
            .WithName("Código de barras");

        RuleFor(x => x.CategoryId).NotEmpty().WithName("Categoria");
        RuleFor(x => x.Unit).IsInEnum().WithName("Unidade");

        RuleFor(x => x.UnitCost)
            .GreaterThanOrEqualTo(0)
            .PrecisionScale(18, 2, ignoreTrailingZeros: true)
            .WithName("Custo unitário");

        RuleFor(x => x.MinimumStock)
            .GreaterThanOrEqualTo(0)
            .PrecisionScale(18, 3, ignoreTrailingZeros: true)
            .WithName("Estoque mínimo");
    }
}

internal sealed class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        Include(new ProductDetailsValidator());

        RuleFor(x => x.Sku)
            .NotEmpty()
            .MaximumLength(Product.SkuMaxLength)
            .Matches("^[A-Za-z0-9-]+$").WithMessage("O SKU aceita apenas letras, números e hífen.")
            .WithName("SKU");

        RuleFor(x => x.InitialQuantity)
            .GreaterThanOrEqualTo(0)
            .PrecisionScale(18, 3, ignoreTrailingZeros: true)
            .WithName("Saldo inicial");
    }
}

internal sealed class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductRequestValidator() => Include(new ProductDetailsValidator());
}

internal sealed class ProductListQueryValidator : AbstractValidator<ProductListQuery>
{
    public ProductListQueryValidator()
    {
        Include(new PagedQueryValidator());
        RuleFor(x => x.Search).MaximumLength(100).WithName("Busca");
        RuleFor(x => x.Status).IsInEnum().WithName("Situação");
        RuleFor(x => x.Sort).IsInEnum().WithName("Ordenação");
    }
}
