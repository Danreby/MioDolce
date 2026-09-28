using FluentValidation;
using MioDolce.Application.Common;
using MioDolce.Domain.Stock;

namespace MioDolce.Application.Features.Stock;

internal sealed class RegisterMovementRequestValidator : AbstractValidator<RegisterMovementRequest>
{
    public RegisterMovementRequestValidator()
    {
        RuleFor(x => x.Type).IsInEnum().WithName("Tipo");

        // Regra condicional: ajuste aceita zero (zerar o estoque), entrada/saída não.
        RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .When(x => x.Type != MovementType.Adjustment)
            .WithName("Quantidade");

        RuleFor(x => x.Quantity)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Type == MovementType.Adjustment)
            .WithName("Saldo contado");

        RuleFor(x => x.Quantity)
            .PrecisionScale(18, 3, ignoreTrailingZeros: true)
            .WithName("Quantidade");

        RuleFor(x => x.Note).MaximumLength(StockMovement.NoteMaxLength).WithName("Observação");
    }
}

internal sealed class MovementListQueryValidator : AbstractValidator<MovementListQuery>
{
    public MovementListQueryValidator()
    {
        Include(new PagedQueryValidator());
        RuleFor(x => x.Type).IsInEnum().WithName("Tipo");
        RuleFor(x => x.ToUtc)
            .GreaterThanOrEqualTo(x => x.FromUtc)
            .When(x => x.FromUtc is not null && x.ToUtc is not null)
            .WithName("Data final");
    }
}
