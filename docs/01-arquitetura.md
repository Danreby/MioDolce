# 1. Arquitetura

## Visão geral

```
 Navegador ──HTML──▶ Next.js (servidor) ──HTTP/JSON──▶ ASP.NET Core API ──SQL──▶ MySQL
                     Server Components                  Controllers
                     Server Actions                     EF Core
```

O navegador **nunca** chama a API diretamente. Quem chama é o servidor do Next.js
(em Server Components para ler e em Server Actions para gravar). Consequências:

- a URL da API não vaza para o cliente e não há problema de CORS;
- os dados chegam ao navegador já renderizados em HTML;
- os formulários funcionam até com JavaScript desligado.

## Backend: Clean Architecture (versão enxuta)

```
            ┌──────────────────────────────┐
            │            Api               │  HTTP: rotas, status codes, DI, middlewares
            │   (composition root)         │
            └──────┬───────────────┬───────┘
                   │               │
                   ▼               ▼
      ┌────────────────────┐  ┌────────────────────┐
      │    Application     │◀─│   Infrastructure   │  EF Core, MySQL, migrations, seed
      │ casos de uso, DTOs │  │  (implementa as    │
      │ validação          │  │   abstrações)      │
      └─────────┬──────────┘  └────────────────────┘
                ▼
      ┌────────────────────┐
      │       Domain       │  entidades e regras. Não depende de NADA.
      └────────────────────┘
```

**Regra de dependência:** as setas só apontam para dentro. O Domain não sabe que existe banco
de dados, HTTP ou JSON. A Application define a interface `IApplicationDbContext` e a
Infrastructure a implementa (Inversão de Dependência). Quem liga tudo é a Api, no `Program.cs`.

Veja isso nos `.csproj`: cada projeto só referencia as camadas permitidas.

| Projeto | Referencia | Arquivo |
| --- | --- | --- |
| Domain | nada | [MioDolce.Domain.csproj](../backend/src/MioDolce.Domain/MioDolce.Domain.csproj) |
| Application | Domain | [MioDolce.Application.csproj](../backend/src/MioDolce.Application/MioDolce.Application.csproj) |
| Infrastructure | Application | [MioDolce.Infrastructure.csproj](../backend/src/MioDolce.Infrastructure/MioDolce.Infrastructure.csproj) |
| Api | Application + Infrastructure | [MioDolce.Api.csproj](../backend/src/MioDolce.Api/MioDolce.Api.csproj) |

### Organização por feature

Dentro da Application, o código fica agrupado por **assunto**, não por tipo técnico:

```
Features/
  Products/
    ProductContracts.cs        records de entrada e saída
    ProductValidators.cs       regras de formato (FluentValidation)
    ProductMappings.cs         entidade → DTO (Expression, vira SQL)
    ProductQueryExtensions.cs  filtros e ordenação
    ProductService.cs          os casos de uso
```

Para mexer em "produtos", tudo está numa pasta só. O frontend segue a mesma ideia em `src/features/`.

## O caminho de uma requisição (siga pelo código)

Vamos acompanhar **"registrar uma saída de 2 kg"**, do clique até o banco.

1. **Formulário (navegador)**
   [movement-form.tsx](../frontend/src/features/movements/components/movement-form.tsx):
   o `<form action={formAction}>` envia o FormData para a Server Action.

2. **Server Action (servidor Next.js)**
   [movements/actions.ts](../frontend/src/features/movements/actions.ts): converte os campos
   e chama `movementsApi.register(...)`, que faz `POST /api/products/{id}/movements`
   através de [lib/api/client.ts](../frontend/src/lib/api/client.ts).

3. **Roteamento e model binding (ASP.NET Core)**
   [StockMovementsController.cs](../backend/src/MioDolce.Api/Controllers/StockMovementsController.cs): a rota
   casa com `[Route("api")]` + `[HttpPost("products/{productId:guid}/movements")]`. O MVC cria o controller
   (injetando o `StockService` no construtor), lê `productId` da rota e desserializa o JSON em `RegisterMovementRequest`.

4. **Validação (action filter)**
   [FluentValidationActionFilter.cs](../backend/src/MioDolce.Api/Filters/FluentValidationActionFilter.cs) roda **antes** da
   action e usa o [RegisterMovementRequestValidator](../backend/src/MioDolce.Application/Features/Stock/StockValidators.cs).
   Se algo estiver errado, a resposta é `400` com os erros por campo e a action nem executa.

5. **Caso de uso (Application)**
   [StockService.RegisterAsync](../backend/src/MioDolce.Application/Features/Stock/StockService.cs):
   carrega o produto, **delega a regra ao domínio** e salva.

6. **Regra de negócio (Domain)**
   [Product.RegisterMovement](../backend/src/MioDolce.Domain/Products/Product.cs): se a saída for maior
   que o saldo, devolve `ProductErrors.InsufficientStock` (um *valor*, não uma exceção).
   Se estiver tudo certo, altera o saldo e cria o `StockMovement`.

7. **Persistência (Infrastructure)**
   `SaveChangesAsync` passa pelo [AuditableEntityInterceptor](../backend/src/MioDolce.Infrastructure/Persistence/Interceptors/AuditableEntityInterceptor.cs)
   (datas + token de concorrência) e o EF Core gera, **numa transação**:
   `INSERT INTO stock_movements ...` e `UPDATE products SET QuantityOnHand = ... WHERE Id = ... AND ConcurrencyStamp = ...`.

8. **Resposta HTTP**
   De volta à action `Register`: sucesso vira `201 Created`; erro vira ProblemDetails com o status certo
   via `Problem(error)` de [ApiControllerBase](../backend/src/MioDolce.Api/Controllers/ApiControllerBase.cs)
   (`422` para estoque insuficiente, `409` para conflito de concorrência, `404` para produto inexistente).

9. **De volta ao Next.js**
   Com sucesso, a action chama `revalidatePath` e a página é re-renderizada com o novo saldo.
   Com erro, o `ApiError` vira `FormState` e a mensagem aparece no formulário.

## O modelo de dados

```
categories 1 ──── * products 1 ──── * stock_movements
```

- **O saldo nunca é editado diretamente.** `products.QuantityOnHand` só muda através de uma movimentação.
- **O livro-razão (`stock_movements`) é imutável.** Erros são corrigidos com um *ajuste*, nunca apagando linhas.
- Cada movimentação guarda `Delta` (variação com sinal) e `BalanceAfter` (saldo resultante), então
  a soma dos deltas de um produto é sempre igual ao saldo dele. Um teste de integração verifica
  exatamente essa invariante sob concorrência.
