using FluentValidation;

namespace MioDolce.Application.Common;

/// <summary>Contrato comum para consultas paginadas.</summary>
public interface IPagedQuery
{
    int Page { get; }

    int PageSize { get; }
}

/// <summary>
/// Regras de paginação reutilizáveis. Os validadores das consultas fazem
/// <c>Include(new PagedQueryValidator())</c> em vez de repetir as regras.
/// </summary>
internal sealed class PagedQueryValidator : AbstractValidator<IPagedQuery>
{
    public PagedQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1).WithName("Página");
        RuleFor(x => x.PageSize).InclusiveBetween(1, Paging.MaxPageSize).WithName("Itens por página");
    }
}
