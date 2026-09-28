namespace MioDolce.Application.Features.Suppliers;

// PASSO 5 do guia docs/06: os MODELS da API (DTOs).
// O que entra (Request) e o que sai (Response) são contratos públicos, separados da entidade.
// Exemplo da diferença: o Request aceita CNPJ com pontuação ("12.345.678/0001-90");
// a entidade normaliza e o Response devolve só os dígitos. A Response também expõe as datas
// de auditoria, mas NÃO expõe o ConcurrencyStamp, que é detalhe interno.

public sealed record SupplierResponse(
    Guid Id,
    string Name,
    string TaxId,
    string? Email,
    string? Phone,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);

public sealed record SupplierRequest(string Name, string TaxId, string? Email, string? Phone);
