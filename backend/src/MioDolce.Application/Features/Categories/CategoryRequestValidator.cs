using FluentValidation;
using MioDolce.Domain.Categories;

namespace MioDolce.Application.Features.Categories;

/// <summary>
/// Validação de ENTRADA (formato, tamanho, obrigatoriedade).
/// Os limites vêm das constantes do domínio: uma única fonte da verdade.
/// </summary>
internal sealed class CategoryRequestValidator : AbstractValidator<CategoryRequest>
{
    public CategoryRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(Category.NameMaxLength)
            .WithName("Nome");

        RuleFor(x => x.Description)
            .MaximumLength(Category.DescriptionMaxLength)
            .WithName("Descrição");
    }
}
