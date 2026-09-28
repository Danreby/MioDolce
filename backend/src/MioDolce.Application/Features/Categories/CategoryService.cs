using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MioDolce.Application.Abstractions;
using MioDolce.Application.Common;
using MioDolce.Domain.Categories;
using MioDolce.Domain.Common;

namespace MioDolce.Application.Features.Categories;

/// <summary>
/// Casos de uso de categorias. Recebe dependências pelo construtor primário (C# 12)
/// e é registrado no contêiner de DI como Scoped (uma instância por requisição HTTP).
/// </summary>
public sealed partial class CategoryService(IApplicationDbContext db, ILogger<CategoryService> logger)
{
    public async Task<IReadOnlyList<CategoryResponse>> ListAsync(CancellationToken cancellationToken) =>
        await db.Categories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new CategoryResponse(
                c.Id,
                c.Name,
                c.Description,
                db.Products.Count(p => p.CategoryId == c.Id),
                c.CreatedAtUtc))
            .ToListAsync(cancellationToken);

    public async Task<Result<CategoryResponse>> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        // Projeção com Select: o SQL busca só as colunas necessárias, sem rastrear a entidade.
        var category = await db.Categories
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CategoryResponse(
                c.Id,
                c.Name,
                c.Description,
                db.Products.Count(p => p.CategoryId == c.Id),
                c.CreatedAtUtc))
            .SingleOrDefaultAsync(cancellationToken);

        return category is null ? CategoryErrors.NotFound(id) : category;
    }

    public async Task<Result<CategoryResponse>> CreateAsync(CategoryRequest request, CancellationToken cancellationToken)
    {
        if (await NameInUseAsync(request.Name, exceptId: null, cancellationToken))
        {
            return CategoryErrors.NameAlreadyExists;
        }

        var category = Category.Create(request.Name, request.Description);
        db.Categories.Add(category);
        await db.SaveChangesAsync(cancellationToken);

        LogCategoryCreated(category.Id, category.Name);
        return new CategoryResponse(category.Id, category.Name, category.Description, 0, category.CreatedAtUtc);
    }

    public async Task<Result<CategoryResponse>> UpdateAsync(Guid id, CategoryRequest request, CancellationToken cancellationToken)
    {
        // Sem AsNoTracking: queremos que o EF rastreie a entidade para gerar o UPDATE.
        var category = await db.Categories.FindAsync([id], cancellationToken);
        if (category is null)
        {
            return CategoryErrors.NotFound(id);
        }

        if (await NameInUseAsync(request.Name, exceptId: id, cancellationToken))
        {
            return CategoryErrors.NameAlreadyExists;
        }

        category.Rename(request.Name, request.Description);

        var saved = await db.SaveChangesSafelyAsync(cancellationToken);
        return saved.IsFailure ? saved.Error : await GetAsync(id, cancellationToken);
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var category = await db.Categories.FindAsync([id], cancellationToken);
        if (category is null)
        {
            return CategoryErrors.NotFound(id);
        }

        if (await db.Products.AnyAsync(p => p.CategoryId == id, cancellationToken))
        {
            return CategoryErrors.HasProducts;
        }

        db.Categories.Remove(category);
        return await db.SaveChangesSafelyAsync(cancellationToken);
    }

    // A collation padrão do MySQL 8 (utf8mb4_0900_ai_ci) já compara sem diferenciar maiúsculas/acentos.
    private Task<bool> NameInUseAsync(string name, Guid? exceptId, CancellationToken cancellationToken)
    {
        var normalized = name.Trim();
        return db.Categories.AnyAsync(c => c.Name == normalized && c.Id != exceptId, cancellationToken);
    }

    // Logging de alta performance gerado em tempo de compilação (evita boxing e parsing de template).
    [LoggerMessage(Level = LogLevel.Information, Message = "Categoria {CategoryId} criada: {CategoryName}")]
    private partial void LogCategoryCreated(Guid categoryId, string categoryName);
}
