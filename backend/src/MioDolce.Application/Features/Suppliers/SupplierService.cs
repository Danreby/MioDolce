using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using MioDolce.Application.Abstractions;
using MioDolce.Application.Common;
using MioDolce.Domain.Common;
using MioDolce.Domain.Suppliers;

namespace MioDolce.Application.Features.Suppliers;

/// <summary>
/// PASSO 7 do guia docs/06: os casos de uso. O controller só chama estes métodos;
/// toda consulta ao banco e toda regra ficam aqui (ou no domínio).
/// </summary>
public sealed class SupplierService(IApplicationDbContext db)
{
    // Projeção reaproveitável: entidade → DTO, traduzida para SQL pelo EF.
    private static readonly Expression<Func<Supplier, SupplierResponse>> ToResponse = s => new SupplierResponse(
        s.Id,
        s.Name,
        s.TaxId,
        s.Email,
        s.Phone,
        s.CreatedAtUtc,
        s.UpdatedAtUtc);

    public async Task<IReadOnlyList<SupplierResponse>> ListAsync(string? search, CancellationToken cancellationToken)
    {
        var suppliers = db.Suppliers.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            var digits = Supplier.NormalizeTaxId(term);
            suppliers = digits.Length > 0
                ? suppliers.Where(s => s.Name.Contains(term) || s.TaxId.Contains(digits))
                : suppliers.Where(s => s.Name.Contains(term));
        }

        return await suppliers
            .OrderBy(s => s.Name)
            .Select(ToResponse)
            .ToListAsync(cancellationToken);
    }

    public async Task<Result<SupplierResponse>> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        var supplier = await db.Suppliers
            .AsNoTracking()
            .Where(s => s.Id == id)
            .Select(ToResponse)
            .SingleOrDefaultAsync(cancellationToken);

        return supplier is null ? SupplierErrors.NotFound(id) : supplier;
    }

    public async Task<Result<SupplierResponse>> CreateAsync(SupplierRequest request, CancellationToken cancellationToken)
    {
        if (await TaxIdInUseAsync(request.TaxId, exceptId: null, cancellationToken))
        {
            return SupplierErrors.TaxIdAlreadyExists;
        }

        var supplier = Supplier.Create(request.Name, request.TaxId, request.Email, request.Phone);
        db.Suppliers.Add(supplier);            // marca como "Added" (INSERT no SaveChanges)
        await db.SaveChangesAsync(cancellationToken);

        return await GetAsync(supplier.Id, cancellationToken);
    }

    public async Task<Result<SupplierResponse>> UpdateAsync(Guid id, SupplierRequest request, CancellationToken cancellationToken)
    {
        // FindAsync busca pela chave e deixa a entidade RASTREADA: alterar as propriedades gera o UPDATE.
        var supplier = await db.Suppliers.FindAsync([id], cancellationToken);
        if (supplier is null)
        {
            return SupplierErrors.NotFound(id);
        }

        if (await TaxIdInUseAsync(request.TaxId, exceptId: id, cancellationToken))
        {
            return SupplierErrors.TaxIdAlreadyExists;
        }

        supplier.Update(request.Name, request.TaxId, request.Email, request.Phone);

        var saved = await db.SaveChangesSafelyAsync(cancellationToken);
        return saved.IsFailure ? saved.Error : await GetAsync(id, cancellationToken);
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var supplier = await db.Suppliers.FindAsync([id], cancellationToken);
        if (supplier is null)
        {
            return SupplierErrors.NotFound(id);
        }

        db.Suppliers.Remove(supplier);         // marca como "Deleted" (DELETE no SaveChanges)
        return await db.SaveChangesSafelyAsync(cancellationToken);
    }

    private Task<bool> TaxIdInUseAsync(string taxId, Guid? exceptId, CancellationToken cancellationToken)
    {
        var digits = Supplier.NormalizeTaxId(taxId);
        return db.Suppliers.AnyAsync(s => s.TaxId == digits && s.Id != exceptId, cancellationToken);
    }
}
