using MioDolce.Domain.Common;

namespace MioDolce.Domain.Categories;

/// <summary>Agrupador de produtos (ex.: "Chocolates", "Embalagens").</summary>
public sealed class Category : AuditableEntity
{
    public const int NameMaxLength = 80;
    public const int DescriptionMaxLength = 280;

    // Construtor vazio privado: exigido pelo EF Core para materializar a entidade vinda do banco.
    private Category()
    {
    }

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    /// <summary>
    /// Factory method: a única forma de criar uma categoria válida.
    /// Setters privados + factory garantem que a entidade nunca exista em estado inválido.
    /// </summary>
    public static Category Create(string name, string? description)
    {
        var category = new Category();
        category.Rename(name, description);
        return category;
    }

    public void Rename(string name, string? description)
    {
        Name = Guard.Text(name, NameMaxLength);
        Description = Guard.OptionalText(description, DescriptionMaxLength);
    }
}
