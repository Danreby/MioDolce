namespace MioDolce.Domain.Common;

/// <summary>
/// Cláusulas de guarda para invariantes do domínio.
/// A validação amigável (mensagens para o usuário) acontece antes, na Application, com FluentValidation.
/// Se algo inválido chegar aqui é bug de programação, por isso lançamos exceção.
/// </summary>
internal static class Guard
{
    public static string Text(string value, int maxLength, [System.Runtime.CompilerServices.CallerArgumentExpression(nameof(value))] string? paramName = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value, paramName);
        var trimmed = value.Trim();
        ArgumentOutOfRangeException.ThrowIfGreaterThan(trimmed.Length, maxLength, paramName);
        return trimmed;
    }

    public static string? OptionalText(string? value, int maxLength, [System.Runtime.CompilerServices.CallerArgumentExpression(nameof(value))] string? paramName = null)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var trimmed = value.Trim();
        ArgumentOutOfRangeException.ThrowIfGreaterThan(trimmed.Length, maxLength, paramName);
        return trimmed;
    }

    public static decimal NotNegative(decimal value, [System.Runtime.CompilerServices.CallerArgumentExpression(nameof(value))] string? paramName = null)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(value, paramName);
        return value;
    }
}
