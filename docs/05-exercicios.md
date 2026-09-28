# 5. Exercícios

Em ordem de dificuldade. Cada um diz por onde começar. Rode `dotnet test` ao final de cada exercício.

## Aquecimento

1. **Novo campo no produto: `Barcode` (opcional, até 20 caracteres).**
   Entidade → configuração do EF → nova migration → contratos → validador → tipos do front → formulário.
   É o exercício que passa por todas as camadas; repare em quantos arquivos você precisa tocar e por quê.

2. **Regra de negócio: observação obrigatória em ajustes.**
   Onde colocar: no validador (formato) ou no domínio (regra)? Justifique e escreva o teste.

3. **Novo filtro: `GET /api/products?minValue=100`** (valor em estoque mínimo).
   Comece por `ProductListQuery` e `ProductQueryExtensions.ApplyFilters`.

## Intermediário

4. **Fornecedor na entrada.** O cadastro de fornecedores já existe (veja o [passo a passo](06-passo-a-passo-controller-model-migration.md)).
   Agora ligue os dois: movimentações de **entrada** passam a aceitar `SupplierId` opcional. Você vai precisar
   de uma FK nova em `stock_movements` (migration), escolher o `OnDelete` e impedir excluir fornecedor que tem entradas.
   Depois crie a tela de fornecedores no Next.

5. **Endpoint de arquivar:** `POST /api/products/{id}/archive` e `/restore`, em vez de mandar `isActive` no PUT.
   Compare os dois desenhos de API.

6. **Rate limiting.** Use `builder.Services.AddRateLimiter` com uma política *fixed window*, `app.UseRateLimiter()`
   e o atributo `[EnableRateLimiting("...")]` só na action de registrar movimentação. Teste com o arquivo `.http`.

7. **Output caching** no `GET /api/dashboard` por 10 segundos (`AddOutputCache` + atributo `[OutputCache]` na action).
   Pense: o que acontece com o painel logo depois de uma movimentação? Como invalidar (tags)?

8. **Tipos gerados.** Gere `frontend/src/lib/api/schema.d.ts` com `npx openapi-typescript http://localhost:5080/openapi/v1.json -o ...`
   e substitua os tipos escritos à mão.

## Avançado

9. **Autenticação.** Proteja a API com JWT (`AddAuthentication().AddJwtBearer()` + `[Authorize]` nos controllers,
   `[AllowAnonymous]` nas leituras) e faça o Next enviar o token a partir das Server Actions.

10. **Relatório CSV.** `GET /api/movements/export?from=...&to=...` devolvendo `text/csv` com `File(stream, "text/csv")`
    no controller, sem carregar tudo em memória (`AsAsyncEnumerable`).

11. **Um filtro seu.** Crie um action filter que mede o tempo de cada action e loga as que passarem de 200 ms.
    Registre-o global (como o `FluentValidationActionFilter`) e depois só em um controller, com `[ServiceFilter]`.

12. **Testes de unidade para os serviços da Application**, com um `FakeTimeProvider`
    (pacote `Microsoft.Extensions.TimeProvider.Testing`) para controlar as datas do painel.

13. **Observabilidade.** Adicione OpenTelemetry (traces de ASP.NET Core + EF Core) e veja no console
    o tempo de cada consulta SQL de uma requisição.

## Para investigar

- Rode a API, abra `/produtos?search=choco` e leia no terminal o SQL gerado. Que índice ajuda essa busca? E o `LIKE '%choco%'`, usa índice?
- Remova `AsNoTracking()` de uma listagem e compare o log. O que muda?
- Remova `AutoTransactionBehavior.Always` do `AppDbContext` e rode o teste de concorrência. Explique a falha.
- Troque os radios de `defaultChecked` para `checked` em `movement-form.tsx`, registre duas saídas seguidas e veja o histórico.
