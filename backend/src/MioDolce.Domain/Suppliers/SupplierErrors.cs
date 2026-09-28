using MioDolce.Domain.Common;

namespace MioDolce.Domain.Suppliers;

public static class SupplierErrors
{
    public static readonly Error TaxIdAlreadyExists = Error.Conflict(
        "Supplier.TaxIdAlreadyExists",
        "Já existe um fornecedor com esse CNPJ.");

    public static Error NotFound(Guid id) => Error.NotFound(
        "Supplier.NotFound",
        $"Fornecedor '{id}' não encontrado.");
}
