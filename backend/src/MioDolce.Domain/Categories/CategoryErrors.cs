using MioDolce.Domain.Common;

namespace MioDolce.Domain.Categories;

public static class CategoryErrors
{
    public static readonly Error NameAlreadyExists = Error.Conflict(
        "Category.NameAlreadyExists",
        "Já existe uma categoria com esse nome.");

    public static readonly Error HasProducts = Error.Conflict(
        "Category.HasProducts",
        "A categoria possui produtos vinculados. Mova-os para outra categoria antes de excluir.");

    public static Error NotFound(Guid id) => Error.NotFound(
        "Category.NotFound",
        $"Categoria '{id}' não encontrada.");
}
