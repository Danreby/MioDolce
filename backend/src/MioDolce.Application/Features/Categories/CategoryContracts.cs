namespace MioDolce.Application.Features.Categories;

// Contratos (DTOs) da feature. São "records": imutáveis, com igualdade por valor e sintaxe curta.
// A API NUNCA expõe as entidades do domínio diretamente, apenas estes contratos.

public sealed record CategoryResponse(
    Guid Id,
    string Name,
    string? Description,
    int ProductCount,
    DateTime CreatedAtUtc);

/// <summary>Usado tanto na criação quanto na edição (os campos são os mesmos).</summary>
public sealed record CategoryRequest(string Name, string? Description);
