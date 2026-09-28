using FluentValidation;
using MioDolce.Domain.Suppliers;

namespace MioDolce.Application.Features.Suppliers;

/// <summary>
/// PASSO 6 do guia docs/06: validação de entrada.
/// Não precisa registrar à mão: AddValidatorsFromAssembly (Application/DependencyInjection.cs)
/// encontra este validador, e o FluentValidationActionFilter o executa antes da action.
/// </summary>
internal sealed class SupplierRequestValidator : AbstractValidator<SupplierRequest>
{
    public SupplierRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(Supplier.NameMaxLength)
            .WithName("Nome");

        // Aceita "12.345.678/0001-90" ou "12345678000190": conta só os dígitos.
        RuleFor(x => x.TaxId)
            .NotEmpty()
            .Must(taxId => Supplier.NormalizeTaxId(taxId).Length == Supplier.TaxIdLength)
            .WithMessage("O CNPJ deve ter 14 dígitos.")
            .WithName("CNPJ");

        RuleFor(x => x.Email)
            .EmailAddress()
            .MaximumLength(Supplier.EmailMaxLength)
            .When(x => !string.IsNullOrWhiteSpace(x.Email))
            .WithName("E-mail");

        RuleFor(x => x.Phone)
            .MaximumLength(Supplier.PhoneMaxLength)
            .WithName("Telefone");
    }
}
