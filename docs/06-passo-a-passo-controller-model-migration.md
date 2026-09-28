# 6. Passo a passo: model, migration e controller do zero

Este guia mostra como um recurso novo nasce em ASP.NET Core, na ordem em que você deve criar
os arquivos. O exemplo é o cadastro de **Fornecedores**, que já está pronto no projeto.
Cada arquivo tem um comentário `PASSO N` para você achar a etapa correspondente no código.

## O mapa

| Passo | O que é | Arquivo | Camada |
| --- | --- | --- | --- |
| 1 | **Model** (entidade) e seus erros | [Supplier.cs](../backend/src/MioDolce.Domain/Suppliers/Supplier.cs), [SupplierErrors.cs](../backend/src/MioDolce.Domain/Suppliers/SupplierErrors.cs) | Domain |
| 2 | Mapeamento para tabela | [SupplierConfiguration.cs](../backend/src/MioDolce.Infrastructure/Persistence/Configurations/SupplierConfiguration.cs) | Infrastructure |
| 3 | `DbSet` no contexto | [AppDbContext.cs](../backend/src/MioDolce.Infrastructure/Persistence/AppDbContext.cs), [IApplicationDbContext.cs](../backend/src/MioDolce.Application/Abstractions/IApplicationDbContext.cs) | Infrastructure / Application |
| 4 | **Migration** | [Migrations/*_AddSuppliers.cs](../backend/src/MioDolce.Infrastructure/Persistence/Migrations/) | Infrastructure |
| 5 | **Models da API** (DTOs) | [SupplierContracts.cs](../backend/src/MioDolce.Application/Features/Suppliers/SupplierContracts.cs) | Application |
| 6 | Validação | [SupplierRequestValidator.cs](../backend/src/MioDolce.Application/Features/Suppliers/SupplierRequestValidator.cs) | Application |
| 7 | Casos de uso | [SupplierService.cs](../backend/src/MioDolce.Application/Features/Suppliers/SupplierService.cs) | Application |
| 8 | Registro no DI | [Application/DependencyInjection.cs](../backend/src/MioDolce.Application/DependencyInjection.cs) | Application |
| 9 | **Controller** | [SuppliersController.cs](../backend/src/MioDolce.Api/Controllers/SuppliersController.cs) | Api |
| 10 | Teste de integração | [SuppliersControllerTests.cs](../backend/tests/MioDolce.Api.IntegrationTests/SuppliersControllerTests.cs) | tests |
| 11 | Teste manual | [MioDolce.Api.http](../backend/src/MioDolce.Api/MioDolce.Api.http) ou http://localhost:5080/scalar | |

A ordem segue as dependências: primeiro o que não depende de nada (o model), por último quem usa tudo (o controller).

---

## "Model" tem dois significados

Em tutoriais de ASP.NET você vai ver uma pasta `Models/` com classes que servem ao mesmo tempo de
tabela do banco e de JSON da API. Funciona em exemplos pequenos, mas mistura duas responsabilidades.
Aqui elas são separadas:

| | Model de domínio (entidade) | Models da API (DTOs) |
| --- | --- | --- |
| Exemplo | `Supplier` | `SupplierRequest`, `SupplierResponse` |
| Representa | a tabela e as regras | o JSON que entra e sai |
| Muda quando | o negócio muda | o contrato com o cliente muda |
| Tem | setters privados, métodos, validação de invariantes | só dados (`record`) |

Por que separar: o banco guarda o CNPJ só com dígitos, mas o `SupplierRequest` aceita
`"12.345.678/0001-90"`. O `ConcurrencyStamp` existe na tabela, mas não aparece no `SupplierResponse`.
Se fosse a mesma classe, qualquer campo novo da tabela vazaria automaticamente na API.

---

## Passo 1: o model (entidade)

```csharp
public sealed class Supplier : AuditableEntity        // herda Id, CreatedAtUtc, UpdatedAtUtc, ConcurrencyStamp
{
    public const int NameMaxLength = 120;              // limites como constantes: usados no EF e no validador

    private Supplier() { }                             // o EF usa este construtor ao ler do banco

    public string Name { get; private set; } = string.Empty;   // private set: só a própria classe altera
    public string TaxId { get; private set; } = string.Empty;
    public string? Email { get; private set; }         // "?" = coluna aceita NULL

    public static Supplier Create(...) { ... }         // única forma de criar um fornecedor válido
    public void Update(...) { ... }                    // normaliza o CNPJ, valida invariantes
}
```

O que o EF Core deduz sozinho (**convenções**):

- a propriedade `Id` vira a **chave primária**;
- `string` vira coluna `NOT NULL`; `string?` vira `NULL` (graças ao Nullable habilitado no projeto);
- propriedades com `private set` são mapeadas normalmente; propriedades **só com get** (calculadas) não.

## Passo 2: a configuração (Fluent API)

Convenção não sabe tudo. Sem configurar, uma `string` viraria `longtext` no MySQL. A
[SupplierConfiguration](../backend/src/MioDolce.Infrastructure/Persistence/Configurations/SupplierConfiguration.cs) diz:

```csharp
builder.ToTable("suppliers");
builder.Property(s => s.Name).HasMaxLength(Supplier.NameMaxLength).IsRequired();   // varchar(120) NOT NULL
builder.Property(s => s.TaxId).HasMaxLength(14).IsFixedLength();                  // char(14)
builder.HasIndex(s => s.TaxId).IsUnique();                                         // índice único
```

Não é preciso registrar a classe: `ApplyConfigurationsFromAssembly` no `AppDbContext` encontra
toda classe que implementa `IEntityTypeConfiguration<T>`.

> A alternativa são atributos na entidade (`[MaxLength(120)]`, `[Table("suppliers")]`). Eles funcionam,
> mas colocariam detalhe de banco dentro do Domain. A Fluent API mantém o Domain limpo.

## Passo 3: o DbSet

```csharp
public DbSet<Supplier> Suppliers => Set<Supplier>();
```

Uma linha no `AppDbContext` e outra na interface `IApplicationDbContext`, que é o que a Application
enxerga. É o `DbSet` que permite escrever `db.Suppliers.Where(...)`.

## Passo 4: a migration

Com o model, a configuração e o DbSet prontos, peça ao EF para comparar o código com o estado anterior:

```bash
cd backend
dotnet tool restore     # só na primeira vez: instala o dotnet-ef listado em dotnet-tools.json
dotnet ef migrations add AddSuppliers \
  --project src/MioDolce.Infrastructure \
  --startup-project src/MioDolce.Api \
  --output-dir Persistence/Migrations
```

- `--project`: onde ficam o `DbContext` e as migrations (Infrastructure).
- `--startup-project`: o projeto que o EF **executa** para montar o `DbContext` com a configuração real
  (connection string, provider). É a Api, porque é ela que tem o `Program.cs`.

### O que é gerado

| Arquivo | Para que serve | Pode editar? |
| --- | --- | --- |
| `20260928194753_AddSuppliers.cs` | `Up()` aplica a mudança, `Down()` desfaz | sim, com cuidado, **antes** de aplicar |
| `20260928194753_AddSuppliers.Designer.cs` | metadados daquela migration | não |
| `AppDbContextModelSnapshot.cs` | "foto" do modelo inteiro, usada para calcular a **próxima** diferença | nunca |

O `Up` gerado para fornecedores:

```csharp
migrationBuilder.CreateTable(
    name: "suppliers",
    columns: table => new
    {
        Id = table.Column<Guid>(type: "char(36)", nullable: false),
        Name = table.Column<string>(type: "varchar(120)", maxLength: 120, nullable: false),
        TaxId = table.Column<string>(type: "char(14)", fixedLength: true, maxLength: 14, nullable: false),
        ...
    },
    constraints: table => table.PrimaryKey("PK_suppliers", x => x.Id));

migrationBuilder.CreateIndex(name: "IX_suppliers_TaxId", table: "suppliers", column: "TaxId", unique: true);
```

**Sempre leia a migration antes de aplicar.** Veja também o SQL exato:

```bash
dotnet ef migrations script InitialCreate AddSuppliers --project src/MioDolce.Infrastructure --startup-project src/MioDolce.Api
```

### Como a migration é aplicada

Neste projeto, em Development, a API aplica sozinha ao subir
([DatabaseExtensions.cs](../backend/src/MioDolce.Api/Extensions/DatabaseExtensions.cs) chama `Database.MigrateAsync()`).
No log você vê `Applying migration '20260928194753_AddSuppliers'`. O controle do que já foi aplicado fica
na tabela `__EFMigrationsHistory`. Para aplicar sem subir a API:

```bash
dotnet ef database update --project src/MioDolce.Infrastructure --startup-project src/MioDolce.Api
```

### Comandos do dia a dia

| Quero... | Comando (sempre com `--project` e `--startup-project`) |
| --- | --- |
| listar migrations e ver quais estão aplicadas | `dotnet ef migrations list` |
| desfazer a última migration **ainda não aplicada** | `dotnet ef migrations remove` |
| voltar o banco para uma migration anterior | `dotnet ef database update InitialCreate` |
| voltar o banco para o zero | `dotnet ef database update 0` |
| saber se esqueci de gerar migration | `dotnet ef migrations has-pending-model-changes` |
| script SQL para produção | `dotnet ef migrations script --idempotent -o migrate.sql` |

### Regras que evitam dor de cabeça

1. **Uma migration por mudança**, com nome que descreve a mudança (`AddSuppliers`, `AddBarcodeToProducts`).
2. **Nunca edite uma migration que já foi aplicada** em outro banco (de um colega ou de produção). Crie uma nova.
3. Errou e a migration **ainda não foi aplicada**? Use `migrations remove`. Se já aplicou só no seu banco local,
   primeiro `database update <anterior>` e depois `migrations remove`.
4. **Renomear** propriedade: o EF pode entender como "apagar coluna + criar coluna" e **perder dados**. Confira se
   o `Up` usa `RenameColumn`; se não usar, ajuste à mão antes de aplicar.
5. Atenção ao aviso *"An operation was scaffolded that may result in the loss of data"*: leia a migration antes de seguir.

## Passo 5: os models da API (DTOs)

```csharp
public sealed record SupplierResponse(Guid Id, string Name, string TaxId, string? Email, string? Phone,
                                      DateTime CreatedAtUtc, DateTime? UpdatedAtUtc);

public sealed record SupplierRequest(string Name, string TaxId, string? Email, string? Phone);
```

`record` porque DTO é só dado: imutável, com igualdade por valor e declarado numa linha.
Os nomes das propriedades viram o JSON em camelCase (`taxId`, `createdAtUtc`).

## Passo 6: a validação

[SupplierRequestValidator](../backend/src/MioDolce.Application/Features/Suppliers/SupplierRequestValidator.cs)
herda `AbstractValidator<SupplierRequest>`. Não há registro manual: `AddValidatorsFromAssembly` encontra o validador,
e o `FluentValidationActionFilter` executa antes de qualquer action que receba um `SupplierRequest`.

## Passo 7: o serviço

[SupplierService](../backend/src/MioDolce.Application/Features/Suppliers/SupplierService.cs) concentra o acesso ao banco.
Os quatro movimentos básicos do EF Core estão lá:

| Operação | Código | SQL no `SaveChanges` |
| --- | --- | --- |
| ler | `db.Suppliers.AsNoTracking().Where(...).Select(ToResponse)` | `SELECT` só com as colunas usadas |
| criar | `db.Suppliers.Add(supplier)` | `INSERT` |
| alterar | `FindAsync(id)` + `supplier.Update(...)` | `UPDATE` só das colunas que mudaram |
| excluir | `db.Suppliers.Remove(supplier)` | `DELETE` |

Repare: no "alterar" não existe `db.Update(...)`. Como o `FindAsync` devolve a entidade **rastreada**,
o EF percebe sozinho quais propriedades mudaram.

## Passo 8: registrar no DI

```csharp
services.AddScoped<SupplierService>();
```

`Scoped` porque o serviço usa o `DbContext`, que também é Scoped (uma instância por requisição).

## Passo 9: o controller

```csharp
[Route("api/suppliers")]
[Tags("Fornecedores")]
public sealed class SuppliersController(SupplierService service) : ApiControllerBase
{
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SupplierResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.GetAsync(id, cancellationToken);
        return result.IsSuccess ? result.Value : Problem(result.Error);
    }

    [HttpPost]
    public async Task<ActionResult<SupplierResponse>> Create(SupplierRequest request, CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(request, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : Problem(result.Error);
    }
}
```

Checklist:

- [ ] herda de `ApiControllerBase` (que já tem `[ApiController]` e o `Problem(Error)`);
- [ ] `[Route]` com o prefixo do recurso, no plural;
- [ ] uma action por operação, com o verbo no atributo;
- [ ] nomes de action **sem** sufixo `Async` (por causa do `CreatedAtAction`);
- [ ] recebe o serviço pelo construtor e **não** acessa o `DbContext` diretamente;
- [ ] status certos: 200, 201 + `Location`, 204, 400, 404, 409;
- [ ] `[ProducesResponseType]` para cada status, para o Scalar mostrar tudo.

Não há registro: `AddControllers()` e `MapControllers()` descobrem a classe sozinhos.
Rode a API e o grupo **Fornecedores** já aparece em http://localhost:5080/scalar.

## Passo 10: o teste

[SuppliersControllerTests](../backend/tests/MioDolce.Api.IntegrationTests/SuppliersControllerTests.cs) faz
requisições HTTP de verdade contra a API em memória e um MySQL em container:

```bash
dotnet test --project tests/MioDolce.Api.IntegrationTests --filter-class "*SuppliersControllerTests"
```

Os testes cobrem: CNPJ formatado salvo só com dígitos, erros de validação por campo, CNPJ duplicado (409)
e o ciclo editar, excluir e confirmar o 404.

## Passo 11: teste manual

Abra [MioDolce.Api.http](../backend/src/MioDolce.Api/MioDolce.Api.http), vá até a seção **Fornecedores** e clique
em "Send Request" em cada bloco (extensão REST Client no VS Code). Ou use a interface do Scalar.

---

## Agora é com você

Repita o processo para um recurso novo, sem olhar o de fornecedores até travar:
**Locais de armazenamento** (`StorageLocation`: nome único e temperatura mínima/máxima opcionais,
ex.: "Câmara fria", "Estoque seco"). Depois faça o produto apontar para um local com uma FK opcional,
que é uma segunda migration, e veja como a migration de uma FK é diferente da de uma tabela nova.
