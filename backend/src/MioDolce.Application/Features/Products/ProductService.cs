using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MioDolce.Application.Abstractions;
using MioDolce.Application.Common;
using MioDolce.Domain.Common;
using MioDolce.Domain.Products;
using MioDolce.Domain.Stock;

namespace MioDolce.Application.Features.Products;

public sealed partial class ProductService(
    IApplicationDbContext db,
    TimeProvider timeProvider,
    ILogger<ProductService> logger)
{
    private const string InitialBalanceNote = "Saldo inicial";

    public Task<PagedResponse<ProductResponse>> ListAsync(ProductListQuery query, CancellationToken cancellationToken) =>
        db.Products
            .AsNoTracking()
            .ApplyFilters(query)
            .ApplySort(query.Sort)
            .Select(ProductMappings.ToResponse)
            .ToPagedResponseAsync(query.Page, query.PageSize, cancellationToken);

    public async Task<Result<ProductResponse>> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        var product = await db.Products
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Select(ProductMappings.ToResponse)
            .SingleOrDefaultAsync(cancellationToken);

        return product is null ? ProductErrors.NotFound(id) : product;
    }

    public async Task<Result<ProductResponse>> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken)
    {
        var sku = request.Sku.Trim().ToUpperInvariant();
        if (await db.Products.AnyAsync(p => p.Sku == sku, cancellationToken))
        {
            return ProductErrors.SkuAlreadyExists;
        }

        if (!await db.Categories.AnyAsync(c => c.Id == request.CategoryId, cancellationToken))
        {
            return ProductErrors.CategoryDoesNotExist;
        }

        var product = Product.Create(
            sku,
            request.Name,
            request.Description,
            barcode: null, // temporário: o passo 3 troca por request.Barcode
            request.CategoryId,
            request.Unit,
            request.UnitCost,
            request.MinimumStock);

        db.Products.Add(product);

        // O saldo inicial também vira uma movimentação: o livro-razão sempre explica o saldo.
        if (request.InitialQuantity > 0)
        {
            var movement = product.RegisterMovement(
                MovementType.Entry,
                request.InitialQuantity,
                InitialBalanceNote,
                timeProvider.GetUtcNow().UtcDateTime);

            if (movement.IsFailure)
            {
                return movement.Error;
            }

            db.StockMovements.Add(movement.Value);
        }

        // Um único SaveChanges = uma única transação: ou grava produto E movimentação, ou nada.
        await db.SaveChangesAsync(cancellationToken);

        LogProductCreated(product.Id, product.Sku);
        return await GetAsync(product.Id, cancellationToken);
    }

    public async Task<Result<ProductResponse>> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken)
    {
        var product = await db.Products.FindAsync([id], cancellationToken);
        if (product is null)
        {
            return ProductErrors.NotFound(id);
        }

        if (product.CategoryId != request.CategoryId
            && !await db.Categories.AnyAsync(c => c.Id == request.CategoryId, cancellationToken))
        {
            return ProductErrors.CategoryDoesNotExist;
        }

        product.UpdateDetails(
            request.Name,
            request.Description,
            product.Barcode, // temporário: mantém o valor atual até o passo 3
            request.CategoryId,
            request.Unit,
            request.UnitCost,
            request.MinimumStock);

        if (request.IsActive)
        {
            product.Reactivate();
        }
        else
        {
            product.Archive();
        }

        var saved = await db.SaveChangesSafelyAsync(cancellationToken);
        return saved.IsFailure ? saved.Error : await GetAsync(id, cancellationToken);
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var product = await db.Products.FindAsync([id], cancellationToken);
        if (product is null)
        {
            return ProductErrors.NotFound(id);
        }

        if (await db.StockMovements.AnyAsync(m => m.ProductId == id, cancellationToken))
        {
            return ProductErrors.HasMovements;
        }

        db.Products.Remove(product);
        return await db.SaveChangesSafelyAsync(cancellationToken);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Produto {ProductId} criado com SKU {Sku}")]
    private partial void LogProductCreated(Guid productId, string sku);
}
