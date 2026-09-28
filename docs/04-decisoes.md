# 4. Decisões técnicas

Registro curto de cada escolha, com a alternativa descartada. Em projeto real, isso é um
**ADR** (Architecture Decision Record).

### .NET 10 (LTS)
Versão com suporte longo (3 anos). O .NET 11 ainda está em RC na data do projeto.

### MySQL: provider oficial da Oracle (`MySql.EntityFrameworkCore`), não o Pomelo
O **Pomelo** é historicamente o provider mais usado pela comunidade, mas parou no EF Core 9
(`9.0.0`). O provider **oficial da Oracle** tem versão estável para o EF Core 10 (`10.0.x`).
Para ficar no .NET 10 + EF Core 10 alinhados, o oficial foi a escolha.

Trade-off a conhecer: foi com ele que apareceu o problema de transação descrito no
[guia de ASP.NET](02-guia-aspnet.md#concorrência-otimista-e-um-bug-real), resolvido com
`AutoTransactionBehavior.Always`. Se um dia o Pomelo lançar a versão 10, trocar é mudar o pacote e
`UseMySQL(...)` por `UseMySql(..., ServerVersion.AutoDetect(...))` na Infrastructure. Nenhuma outra camada muda.

### MySQL 8.4 no Docker, porta 3307
8.4 é a linha LTS do MySQL. A porta 3307 evita conflito com um MySQL instalado na máquina.

### Controllers em vez de Minimal APIs
O projeto começou com Minimal APIs (a recomendação da Microsoft para projetos novos) e passou para
**Controllers** para estudar o modelo mais presente em projetos existentes e vagas: `ControllerBase`,
`[ApiController]`, roteamento por atributo, model binding e filtros MVC. Como a Application não conhece
HTTP, a troca mexeu só na camada Api. As duas formas estão comparadas no [guia](02-guia-aspnet.md#23-controllers).

### Clean Architecture enxuta (4 projetos)
Separa regra de negócio de detalhe técnico e deixa as dependências explícitas nos `.csproj`.
Para um CRUD minúsculo seria exagero; aqui o objetivo é **estudar** a separação.

### Sem Repository genérico
O `DbContext` já é Unit of Work, e o `DbSet` já é Repository. A Application depende da interface
`IApplicationDbContext`, que é a abstração que importa.

### Sem MediatR e sem AutoMapper
Ambos passaram a ter licença comercial em 2025. Serviços simples + mapeamento manual com
`Expression` são mais explícitos para quem está aprendendo: dá para ler exatamente o que acontece.

### Serviços concretos, sem interface
`ProductService` é injetado direto. Interface para cada serviço só se justifica com mais de uma
implementação ou necessidade de mock. Os testes de integração exercitam o serviço real.

### Result pattern para erros de negócio
Exceções ficam para o inesperado. Erros de negócio viram valores (`Result`), e o compilador obriga
quem chama a tratar o caso de falha.

### FluentValidation, não DataAnnotations
Regras condicionais e reuso (`Include`) ficam mais claros, e os validadores moram na Application,
longe do HTTP. Com controllers, quem executa os validadores é um action filter global; o pacote antigo
`FluentValidation.AspNetCore` (validação automática) foi descontinuado pelos autores.

### Guid v7 como chave
Gerado no código (sem ida ao banco para descobrir o ID) e ordenado pelo tempo, o que evita a
fragmentação de índice de um Guid aleatório. No MySQL fica em `char(36)`; `binary(16)` economizaria
espaço, com o custo de legibilidade ao consultar o banco à mão.

### Enums salvos como texto
`'Kilogram'` em vez de `1`: o banco fica legível e reordenar o enum no C# não corrompe dados.

### Saldo + livro-razão
O saldo fica denormalizado em `products.QuantityOnHand` (leitura rápida) e cada mudança gera uma
linha imutável em `stock_movements` (auditoria). A consistência entre os dois é garantida por
transação + concorrência otimista, e verificada por teste.

### Next.js chama a API pelo servidor
Server Components para leitura e Server Actions para escrita. A URL da API fica no servidor,
não há CORS no caminho principal e o HTML chega pronto. A política de CORS da API existe para quando
você quiser experimentar chamadas do navegador.

### Tipos TypeScript escritos à mão
Ficam em `features/*/types.ts`, espelhando os records do C#. É mais fácil de ler enquanto se aprende.
O próximo passo natural é gerar a partir do OpenAPI (veja os exercícios).
