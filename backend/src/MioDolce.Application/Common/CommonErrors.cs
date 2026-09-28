using MioDolce.Domain.Common;

namespace MioDolce.Application.Common;

public static class CommonErrors
{
    public static readonly Error ConcurrencyConflict = Error.Conflict(
        "Common.ConcurrencyConflict",
        "Este registro foi alterado por outra operação enquanto você trabalhava. Recarregue e tente novamente.");
}
