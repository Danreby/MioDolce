namespace MioDolce.Domain.Common;

/// <summary>Categoria do erro. A API traduz cada tipo para um status HTTP.</summary>
public enum ErrorType
{
    Failure,
    Validation,
    NotFound,
    Conflict,
    BusinessRule,
}

/// <summary>
/// Erro esperado de negócio (ex.: "estoque insuficiente").
/// Erros esperados são VALORES retornados, não exceções: exceções ficam para o inesperado.
/// </summary>
public sealed record Error(string Code, string Description, ErrorType Type)
{
    public static readonly Error None = new(string.Empty, string.Empty, ErrorType.Failure);

    public static Error NotFound(string code, string description) => new(code, description, ErrorType.NotFound);

    public static Error Conflict(string code, string description) => new(code, description, ErrorType.Conflict);

    public static Error BusinessRule(string code, string description) => new(code, description, ErrorType.BusinessRule);

    public static Error Validation(string code, string description) => new(code, description, ErrorType.Validation);
}
