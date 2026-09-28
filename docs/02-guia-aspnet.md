# 2. Guia de ASP.NET Core (conceito → arquivo)

Cada seção explica um conceito e aponta **onde ele está no projeto**. Sugestão: leia a seção,
abra o arquivo e depois quebre algo de propósito para ver o que acontece.

---

## 2.1 Program.cs: serviços e pipeline

[Program.cs](../backend/src/MioDolce.Api/Program.cs) tem duas fases:

1. **Registro de serviços** (`builder.Services...`): diz ao contêiner de injeção de dependência
   (DI) como criar cada classe.
2. **Pipeline de middlewares** (`app.Use...`, `app.Map...`): define por onde cada requisição passa.
   **A ordem importa**: `UseExceptionHandler` vem primeiro para capturar erros de tudo que vem depois.

Cada camada tem seu método de extensão: `AddApplication()`, `AddInfrastructure()`, `AddPresentation()`.
Assim o `Program.cs` fica curto e cada projeto é dono do próprio registro.

## 2.2 Injeção de dependência e tempo de vida

| Tempo de vida | Significa | Exemplo no projeto |
| --- | --- | --- |
| `Singleton` | uma instância para a aplicação inteira | `TimeProvider`, `AuditableEntityInterceptor` |
| `Scoped` | uma instância por requisição HTTP | `AppDbContext`, `ProductService` |
| `Transient` | nova instância a cada injeção | (não usado aqui) |

Veja em [Application/DependencyInjection.cs](../backend/src/MioDolce.Application/DependencyInjection.cs)
e [Infrastructure/DependencyInjection.cs](../backend/src/MioDolce.Infrastructure/DependencyInjection.cs).

> **Regra de ouro:** um serviço nunca deve depender de outro com tempo de vida *menor*.
> Um Singleton que recebe um DbContext (Scoped) guardaria a mesma conexão para sempre.

Repare no **construtor primário** (C# 12): `public sealed class CategoryService(IApplicationDbContext db, ...)`.
Os parâmetros viram campos acessíveis na classe inteira, sem boilerplate.

## 2.3 Controllers

Os controllers ficam em [Controllers/](../backend/src/MioDolce.Api/Controllers/), um por recurso.
Para montar um do zero, siga o [passo a passo](06-passo-a-passo-controller-model-migration.md).

### Anatomia

```csharp
[Route("api/categories")]                       // prefixo das rotas do controller
[Tags("Categorias")]                            // agrupamento no OpenAPI/Scalar
public sealed class CategoriesController(CategoryService service) : ApiControllerBase
{
    [HttpGet("{id:guid}")]                      // GET api/categories/{id}
    [ProducesResponseType<CategoryResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CategoryResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.GetAsync(id, cancellationToken);
        return result.IsSuccess ? result.Value : Problem(result.Error);
    }
}
```

| Peça | Para que serve |
| --- | --- |
| `ControllerBase` | base para APIs. `Controller` (sem "Base") acrescenta suporte a Views/Razor, que uma API não usa |
| `[ApiController]` | está em [ApiControllerBase](../backend/src/MioDolce.Api/Controllers/ApiControllerBase.cs) e vale para todos os herdeiros: exige rota por atributo, infere a origem dos parâmetros e responde 400 sozinho se o *model binding* falhar |
| `[Route]` + `[HttpGet]`/`[HttpPost]`... | **roteamento por atributo**: o caminho completo é o prefixo mais o trecho da action |
| `{id:guid}` | **restrição de rota**: `api/categories/abc` vira 404 antes de chegar na action |
| construtor | as dependências vêm do DI. **Uma instância nova do controller por requisição** |
| `ActionResult<T>` | a action pode devolver o valor (vira 200) ou qualquer `ActionResult` (404, 409...) |
| `[ProducesResponseType]` | documenta cada status possível para o OpenAPI |
| `[EndpointSummary]` | o texto que aparece no Scalar |

### De onde vem cada parâmetro (model binding)

Com `[ApiController]`, a origem é **inferida**:

| Parâmetro | Origem inferida | Exemplo |
| --- | --- | --- |
| nome que aparece na rota | rota | `Guid id` em `[HttpGet("{id:guid}")]` |
| tipo simples (string, int, Guid...) | query string | `string? search` vira `?search=...` |
| tipo complexo (classe/record) | **corpo JSON** | `CategoryRequest request` |
| `CancellationToken` | cancelado se o cliente desistir | `CancellationToken cancellationToken` |
| serviço registrado no DI | contêiner | só com `[FromServices]` explícito |

**Pegadinha:** um record de filtros (`ProductListQuery`) é tipo complexo, então seria lido do *corpo*.
Por isso ele leva `[FromQuery]` em [ProductsController](../backend/src/MioDolce.Api/Controllers/ProductsController.cs).

### Os helpers de resposta do `ControllerBase`

| Método | Status |
| --- | --- |
| `Ok(valor)` ou `return valor;` | 200 |
| `CreatedAtAction(nameof(GetById), new { id }, valor)` | 201 + cabeçalho `Location` |
| `Created(url, valor)` | 201 com a URL escrita à mão |
| `NoContent()` | 204 |
| `Problem(error)` (nosso, em `ApiControllerBase`) | 400/404/409/422 conforme o tipo do erro |

**Pegadinha do sufixo `Async`:** por padrão o MVC **remove "Async"** do nome das actions. Se a action
se chamasse `GetByIdAsync`, o `CreatedAtAction(nameof(GetByIdAsync), ...)` não acharia a rota e daria erro.
Por isso as actions aqui não têm o sufixo.

### Registro

Nada é registrado controller a controller. Em [Api/DependencyInjection.cs](../backend/src/MioDolce.Api/DependencyInjection.cs),
`AddControllers()` descobre toda classe pública que herda de `ControllerBase`. No
[Program.cs](../backend/src/MioDolce.Api/Program.cs), `MapControllers()` liga as rotas dos atributos.
Duas configurações importantes estão ali:

- `SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true`: com `Nullable` ligado, o MVC
  trataria toda `string` não anulável como `[Required]` e responderia 400 **em inglês, antes do FluentValidation**.
  Desligamos para a validação ter um dono só.
- `AddJsonOptions(...)`: controllers usam as opções de JSON **do MVC**, que são separadas das de
  `ConfigureHttpJsonOptions` (essas valem para Minimal APIs e para o gerador de OpenAPI). Configuramos as duas.

### E as Minimal APIs?

São a outra forma de criar endpoints no ASP.NET Core, e a Microsoft as recomenda para projetos novos.
A mesma action acima, como Minimal API:

```csharp
app.MapGet("/api/categories/{id:guid}", async (Guid id, CategoryService service, CancellationToken ct) =>
{
    var result = await service.GetAsync(id, ct);
    return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound();
});
```

Como os serviços da Application não sabem nada de HTTP, este projeto trocou de Minimal APIs para
Controllers mexendo **só na camada Api**. Vale conhecer as duas formas: as duas aparecem no mercado.

## 2.4 Validação: FluentValidation + action filter

- Os validadores ficam junto dos contratos: [ProductValidators.cs](../backend/src/MioDolce.Application/Features/Products/ProductValidators.cs).
- Os limites (tamanho máximo etc.) vêm das **constantes do domínio** (`Product.NameMaxLength`),
  então a regra existe num lugar só.
- **Reuso com `Include`:** `ProductDetailsValidator` valida a interface `IProductDetails`, usada tanto
  na criação quanto na edição. O mesmo vale para a paginação (`PagedQueryValidator`).
- **Regras condicionais:** `.When(x => x.Type == MovementType.Adjustment)` em
  [StockValidators.cs](../backend/src/MioDolce.Application/Features/Stock/StockValidators.cs).

Quem executa os validadores é o [FluentValidationActionFilter](../backend/src/MioDolce.Api/Filters/FluentValidationActionFilter.cs),
um **action filter global**. O pipeline de uma requisição MVC é:

```
roteamento → model binding → [ApiController] (400 se o binding falhou) → action filters → action → resultado
```

O filtro percorre os argumentos da action, pede ao DI um `IValidator<T>` para cada tipo e, se houver
erros, define `context.Result`. Isso **curto-circuita** o pipeline: a action nem executa.

Existem dois tipos de 400, e vale saber distinguir:

| Situação | Quem responde | Onde se personaliza |
| --- | --- | --- |
| JSON malformado, `?page=abc`, enum inexistente | `[ApiController]` (o binding falhou) | `InvalidModelStateResponseFactory` em Api/DependencyInjection.cs |
| nome vazio, CNPJ com 13 dígitos | FluentValidation (dados legíveis, mas inválidos) | nos validadores da Application |

**Validação de entrada x regra de negócio:** "nome é obrigatório" é validação (400).
"Não pode sair mais do que o saldo" é regra de negócio: depende do estado do banco, então fica no domínio (422).

## 2.5 Erros: Result pattern + ProblemDetails

Dois tipos de erro, dois mecanismos:

| Tipo | Exemplo | Mecanismo |
| --- | --- | --- |
| **Esperado** (faz parte do negócio) | estoque insuficiente, SKU duplicado | `Result`/`Error` retornados como valor |
| **Inesperado** (bug, infraestrutura) | banco fora do ar, NullReference | exceção → `GlobalExceptionHandler` → 500 |

- [Result.cs](../backend/src/MioDolce.Domain/Common/Result.cs) e [Error.cs](../backend/src/MioDolce.Domain/Common/Error.cs):
  conversões implícitas deixam escrever `return ProductErrors.NotFound(id);` ou `return product;`.
- [ProductErrors.cs](../backend/src/MioDolce.Domain/Products/ProductErrors.cs): catálogo de erros com código estável (`Product.InsufficientStock`).
- `Problem(Error)` em [ApiControllerBase](../backend/src/MioDolce.Api/Controllers/ApiControllerBase.cs): o **único** lugar que traduz tipo de erro para status HTTP.
  Usa a `ProblemDetailsFactory` do ASP.NET, que já acrescenta `type`, `traceId` e o `instance` configurado no DI.
- [GlobalExceptionHandler](../backend/src/MioDolce.Api/Infrastructure/GlobalExceptionHandler.cs): implementa `IExceptionHandler` (.NET 8+). Registra em log e devolve 500 **sem vazar detalhes internos**.
- `AddProblemDetails` faz **todas** as respostas de erro seguirem a RFC 9457, inclusive 404/405 do próprio framework.

## 2.6 Options pattern

Configuração tipada em vez de `configuration["Chave"]` espalhado:

- [DatabaseOptions](../backend/src/MioDolce.Infrastructure/Persistence/DatabaseOptions.cs) ↔ seção `"Database"` do appsettings.
- [FrontendOptions](../backend/src/MioDolce.Api/Infrastructure/FrontendOptions.cs) com `[Required]` + `ValidateOnStart()`:
  se a configuração estiver errada, a API **nem sobe**, em vez de falhar no meio de uma requisição.
- Em [Api/DependencyInjection.cs](../backend/src/MioDolce.Api/DependencyInjection.cs) há um exemplo de
  options que depende de outra options (`Configure<IOptions<FrontendOptions>>`) para montar o CORS.

**Hierarquia de configuração** (a última ganha): `appsettings.json` → `appsettings.{Ambiente}.json` →
user-secrets (só em Development) → variáveis de ambiente → argumentos de linha de comando.
Por isso a connection string de produção deve vir de variável de ambiente
(`ConnectionStrings__MioDolce=...`, com dois underscores), nunca do arquivo versionado.

## 2.7 Entity Framework Core

| Conceito | Onde |
| --- | --- |
| DbContext + `ApplyConfigurationsFromAssembly` | [AppDbContext.cs](../backend/src/MioDolce.Infrastructure/Persistence/AppDbContext.cs) |
| Fluent API (um arquivo por entidade) | [Configurations/](../backend/src/MioDolce.Infrastructure/Persistence/Configurations/) |
| Precisão de decimal, enum como texto, índices, FK com `Restrict` | [ProductConfiguration.cs](../backend/src/MioDolce.Infrastructure/Persistence/Configurations/ProductConfiguration.cs) |
| Migrations | [Migrations/](../backend/src/MioDolce.Infrastructure/Persistence/Migrations/) |
| Interceptor (`SaveChangesInterceptor`) | [AuditableEntityInterceptor.cs](../backend/src/MioDolce.Infrastructure/Persistence/Interceptors/AuditableEntityInterceptor.cs) |
| Concorrência otimista (`IsConcurrencyToken`) | [AuditableEntityConfiguration.cs](../backend/src/MioDolce.Infrastructure/Persistence/Configurations/AuditableEntityConfiguration.cs) |
| Seed com `UseSeeding`/`UseAsyncSeeding` (EF 9+) | [InventorySeeder.cs](../backend/src/MioDolce.Infrastructure/Persistence/Seed/InventorySeeder.cs) |

Boas práticas de consulta usadas nos serviços:

- **`AsNoTracking()`** em leituras: o EF não guarda cópias para detectar mudanças (mais rápido).
- **Projeção com `Select`** direto para o DTO ([ProductMappings.cs](../backend/src/MioDolce.Application/Features/Products/ProductMappings.cs)):
  o SQL traz só as colunas necessárias e faz o JOIN sozinho. Por ser uma `Expression`, o EF consegue traduzi-la.
- **`IQueryable` composto em etapas** ([ProductQueryExtensions.cs](../backend/src/MioDolce.Application/Features/Products/ProductQueryExtensions.cs)):
  nada vai ao banco até o `ToListAsync`/`CountAsync`.
- **Ordenação estável na paginação:** sempre um desempate (`ThenBy(p => p.Id)`).
- **Consultas em sequência, não em paralelo**, com o mesmo DbContext ([DashboardService.cs](../backend/src/MioDolce.Application/Features/Dashboard/DashboardService.cs)).
  O DbContext não é thread-safe.

> **Experimento:** o `appsettings.Development.json` loga os comandos SQL
> (`Microsoft.EntityFrameworkCore.Database.Command: Information`). Rode a API, abra a lista de
> produtos e leia no terminal o SQL que cada filtro gera.

### Concorrência otimista (e um bug real)

Todo `UPDATE` inclui `WHERE ConcurrencyStamp = <valor lido>`. Se duas requisições tentam tirar
estoque do mesmo produto ao mesmo tempo, a segunda afeta 0 linhas, o EF lança
`DbUpdateConcurrencyException` e o serviço devolve `409` ([DbContextExtensions.cs](../backend/src/MioDolce.Application/Common/DbContextExtensions.cs)).

Durante o desenvolvimento, um teste disparando 20 saídas simultâneas revelou um bug: o `UPDATE`
falhava, mas o `INSERT` da movimentação **ficava gravado**. O provider MySQL não estava abrindo
transação para o lote de comandos. A correção é uma linha no construtor do
[AppDbContext](../backend/src/MioDolce.Infrastructure/Persistence/AppDbContext.cs):
`Database.AutoTransactionBehavior = AutoTransactionBehavior.Always`. O teste
`ConcurrentExits_NeverOversell_AndLedgerMatchesBalance` impede que isso volte.
Tire a linha e rode o teste para ver a falha acontecer.

## 2.8 Domínio rico

[Product.cs](../backend/src/MioDolce.Domain/Products/Product.cs) mostra entidade com comportamento:

- **setters privados** + **factory method** (`Product.Create`): não existe produto inválido.
- **Construtor privado vazio**: só para o EF materializar do banco.
- **Um único ponto que altera o saldo** (`RegisterMovement`): impossível esquecer a regra.
- `StockMovement.Record` é `internal`: só o agregado `Product` cria movimentações.
- **Guard clauses** ([Guard.cs](../backend/src/MioDolce.Domain/Common/Guard.cs)) com `CallerArgumentExpression`
  para mensagens de erro com o nome do parâmetro.
- **Guid v7** (`Guid.CreateVersion7()`, .NET 9+): ordenado pelo tempo, bom para índice.

## 2.9 Outros recursos que valem a leitura

- **`TimeProvider`** em vez de `DateTime.UtcNow`: nos testes dá para controlar o relógio.
- **Logging gerado em compilação** (`[LoggerMessage]` em métodos `partial`): veja o fim de
  [ProductService.cs](../backend/src/MioDolce.Application/Features/Products/ProductService.cs).
- **Health checks** com checagem do banco: `GET /health`.
- **OpenAPI nativo** (`AddOpenApi`, .NET 9+) + **Scalar** como interface: `/scalar`.
- **JSON com enums como texto** (`JsonStringEnumConverter`).
- **Arquivo `.http`** para testar a API sem sair do editor: [MioDolce.Api.http](../backend/src/MioDolce.Api/MioDolce.Api.http).

## 2.10 Organização da solução

- [Directory.Build.props](../backend/Directory.Build.props): `Nullable`, `TreatWarningsAsErrors`, analisadores `latest-recommended`, em todos os projetos.
- [Directory.Packages.props](../backend/Directory.Packages.props): **Central Package Management**, versões num lugar só.
- [.editorconfig](../backend/.editorconfig): estilo de código aplicado no build. Cada regra desligada tem justificativa comentada.
- [global.json](../backend/global.json): fixa o SDK e ativa a **Microsoft Testing Platform** no `dotnet test`.
- [dotnet-tools.json](../backend/dotnet-tools.json): `dotnet-ef` como ferramenta *local* (`dotnet tool restore`).
- `MioDolce.slnx`: o formato novo de solução, em XML legível.

## 2.11 Testes

| Tipo | Projeto | O que testa |
| --- | --- | --- |
| Unidade | [MioDolce.Domain.Tests](../backend/tests/MioDolce.Domain.Tests/) | regras do domínio, sem banco nem HTTP (rápidos) |
| Integração | [MioDolce.Api.IntegrationTests](../backend/tests/MioDolce.Api.IntegrationTests/) | a API inteira via HTTP, contra MySQL real |

- **xUnit v3**: `[Fact]`, `[Theory]` + `[InlineData]`, `TestContext.Current.CancellationToken`.
- **`WebApplicationFactory<Program>`** sobe a API em memória; `CreateClient()` devolve um `HttpClient` apontando para ela.
- **Testcontainers** cria um MySQL descartável por execução ([ApiFactory.cs](../backend/tests/MioDolce.Api.IntegrationTests/Infrastructure/ApiFactory.cs)).
  Testar contra o banco real pega diferenças que SQLite/InMemory esconderiam (o bug de transação, por exemplo).
- **Assembly fixture** (`[assembly: AssemblyFixture]`, xUnit v3): um container para todos os testes;
  cada teste cria seus próprios dados com nomes únicos.
