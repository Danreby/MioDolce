using MioDolce.Domain.Common;

namespace MioDolce.Domain.Suppliers;

/// <summary>
/// PASSO 1 do guia docs/06: o MODEL (entidade).
///
/// Em ASP.NET, "model" costuma significar duas coisas diferentes:
///   1. o modelo de DOMÍNIO / de dados: esta classe, que vira a tabela "suppliers" no banco;
///   2. os modelos de ENTRADA e SAÍDA da API (DTOs): SupplierRequest / SupplierResponse,
///      em Application/Features/Suppliers/SupplierContracts.cs.
/// Separar os dois evita expor o banco na API e permite mudar um sem quebrar o outro.
/// </summary>
public sealed class Supplier : AuditableEntity
{
    public const int NameMaxLength = 120;
    public const int TaxIdLength = 14; // CNPJ: 14 dígitos
    public const int EmailMaxLength = 254;
    public const int PhoneMaxLength = 20;

    // Exigido pelo EF Core para criar a instância ao ler do banco.
    private Supplier()
    {
    }

    public string Name { get; private set; } = string.Empty;

    /// <summary>CNPJ guardado só com dígitos ("12345678000190"), sem pontuação.</summary>
    public string TaxId { get; private set; } = string.Empty;

    public string? Email { get; private set; }

    public string? Phone { get; private set; }

    public static Supplier Create(string name, string taxId, string? email, string? phone)
    {
        var supplier = new Supplier();
        supplier.Update(name, taxId, email, phone);
        return supplier;
    }

    public void Update(string name, string taxId, string? email, string? phone)
    {
        var digits = NormalizeTaxId(taxId);
        if (digits.Length != TaxIdLength)
        {
            throw new ArgumentException($"O CNPJ deve ter {TaxIdLength} dígitos.", nameof(taxId));
        }

        Name = Guard.Text(name, NameMaxLength);
        TaxId = digits;
        Email = Guard.OptionalText(email, EmailMaxLength)?.ToLowerInvariant();
        Phone = Guard.OptionalText(phone, PhoneMaxLength);
    }

    /// <summary>"12.345.678/0001-90" → "12345678000190".</summary>
    public static string NormalizeTaxId(string? value) =>
        new((value ?? string.Empty).Where(char.IsAsciiDigit).ToArray());
}
