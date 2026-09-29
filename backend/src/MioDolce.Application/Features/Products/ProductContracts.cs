using MioDolce.Application.Common;
using MioDolce.Domain.Products;

namespace MioDolce.Application.Features.Products;

public sealed record ProductResponse(
    Guid Id,
    string Sku,
    string Name,
    string? Description,
    string? Barcode,
    Guid CategoryId,
    string CategoryName,
    UnitOfMeasure Unit,
    decimal UnitCost,
    decimal QuantityOnHand,
    decimal MinimumStock,
    decimal StockValue,
    StockStatus Status,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);

/// <summary>Campos editáveis de um produto, compartilhados entre criação e edição.</summary>
public interface IProductDetails
{
    string Name { get; }

    string? Description { get; }

    string? Barcode { get; }

    Guid CategoryId { get; }

    UnitOfMeasure Unit { get; }

    decimal UnitCost { get; }

    decimal MinimumStock { get; }
}

public sealed record CreateProductRequest(
    string Sku,
    string Name,
    string? Description,
    string? Barcode,
    Guid CategoryId,
    UnitOfMeasure Unit,
    decimal UnitCost,
    decimal MinimumStock,
    decimal InitialQuantity) : IProductDetails;

/// <summary>O SKU não aparece aqui de propósito: ele é imutável depois de criado.</summary>
public sealed record UpdateProductRequest(
    string Name,
    string? Description,
    string? Barcode,
    Guid CategoryId,
    UnitOfMeasure Unit,
    decimal UnitCost,
    decimal MinimumStock,
    bool IsActive) : IProductDetails;

public enum ProductSort
{
    Name,
    Sku,
    LowestStock,
    HighestValue,
    Newest,
}

/// <summary>
/// Parâmetros de query string de GET /api/products.
/// No controller é recebido com [FromQuery]: cada parâmetro do construtor vira um ?parametro=.
/// Valores padrão tornam o parâmetro opcional.
/// </summary>
public sealed record ProductListQuery(
    string? Search = null,
    Guid? CategoryId = null,
    StockStatus? Status = null,
    bool IncludeInactive = false,
    ProductSort Sort = ProductSort.Name,
    int Page = 1,
    int PageSize = Paging.DefaultPageSize) : IPagedQuery;
