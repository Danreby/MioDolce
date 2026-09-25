# Almoxarife

Sistema de controle de estoque feito para **estudar NestJS e Next.js** juntos.
O domínio é pequeno (categorias, produtos e movimentações), mas cada parte
foi escrita do jeito que se faz em projetos reais, com comentários no código
explicando o *porquê* das decisões.

| Camada   | Tecnologia                                                     |
| -------- | -------------------------------------------------------------- |
| Front    | Next.js 16 (App Router, Server Actions, Cache Components), React 19, Tailwind CSS v4 |
| API      | NestJS 12 (ESM), class-validator, Swagger                       |
| Banco    | MySQL 8.4 via Docker, Prisma ORM 7                              |
| Testes   | Vitest (API)                                                    |

---

## Como rodar

Pré-requisitos: **Node 22+** e **Docker Desktop** aberto.

```bash
npm install                       # instala as duas apps (npm workspaces)

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

npm run db:up                     # sobe o MySQL (porta 3307)
npm run db:migrate                # cria as tabelas
npm run db:seed                   # dados de exemplo: 20 produtos, ~180 movimentações

npm run dev                       # API em :3333 e front em :3000
```

- Front: http://localhost:3000
- API: http://localhost:3333/api/v1
- **Swagger (documentação interativa da API): http://localhost:3333/docs**

Outros comandos úteis:

```bash
npm test                          # testes unitários da API
npm run lint                      # lint das duas apps
npm run build                     # build de produção das duas apps
npm run db:studio -w api          # Prisma Studio: navegador visual do banco
npm run db:seed                   # recria os dados de exemplo (apaga tudo antes)
```

---

## Estrutura

```
.
├── docker-compose.yml            MySQL local
├── apps/
│   ├── api/                      NestJS
│   │   ├── prisma/
│   │   │   ├── schema.prisma     modelo do banco (comece a leitura por aqui)
│   │   │   ├── migrations/       SQL gerado e versionado
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── main.ts           bootstrap: pipes, filtros, CORS, Swagger
│   │       ├── app.module.ts     módulo raiz
│   │       ├── config/           variáveis de ambiente validadas com zod
│   │       ├── prisma/           PrismaService como provider injetável
│   │       ├── common/           paginação, filtro de erros do Prisma
│   │       └── modules/
│   │           ├── categories/       controller + service + dto
│   │           ├── products/
│   │           ├── stock-movements/  a regra de negócio principal + teste
│   │           └── dashboard/        agregações com SQL puro
│   └── web/                      Next.js
│       └── src/
│           ├── app/              rotas (cada pasta = uma URL)
│           ├── components/ui/    componentes visuais genéricos
│           ├── components/layout/
│           ├── features/         código de cada domínio
│           │   └── products/
│           │       ├── api.ts         leitura (server-only)
│           │       ├── actions.ts     escrita (Server Actions)
│           │       ├── schemas.ts     validação com zod
│           │       └── components/
│           └── lib/              cliente HTTP, formatação, tipos
```

A regra de organização nas duas apps é a mesma: **agrupar por funcionalidade,
não por tipo de arquivo**. Tudo sobre produtos fica junto. Para apagar ou
entender uma feature você abre uma pasta só.

---

## Por onde estudar

Uma ordem que funciona bem:

### 1. O banco: `apps/api/prisma/schema.prisma`

- Três modelos e a relação entre eles.
- `Decimal` para dinheiro (nunca `Float`).
- `@@map` / `@map`: nomes em snake_case no banco, camelCase no código.
- Compare com `prisma/migrations/*/migration.sql` para ver o SQL real gerado.

### 2. Um módulo simples do Nest: `modules/categories`

Leia nesta ordem: `categories.module.ts` → `categories.controller.ts` → `categories.service.ts` → `dto/`.

- **Module** declara o que existe; **Controller** traduz HTTP; **Service** tem as regras.
- Injeção de dependência: o service pede `PrismaService` no construtor e o Nest entrega.
- DTOs com decorators do class-validator + o `ValidationPipe` global em `main.ts`
  (`whitelist` + `forbidNonWhitelisted` rejeitam campos extras).
- Teste no Swagger: tente criar uma categoria com nome repetido e veja o 409.

### 3. A regra de negócio: `modules/stock-movements/stock-movements.service.ts`

O arquivo mais importante do backend.

- **Livro-razão (ledger)**: movimentações só são inseridas, nunca editadas.
  `Product.quantity` é um saldo desnormalizado para leitura rápida.
- **Transação**: o saldo e a movimentação são gravados juntos ou nenhum dos dois.
- **Concorrência otimista**: o `updateMany` com `where: { quantity: <saldo lido> }`
  impede que duas saídas simultâneas deixem o estoque negativo.
- Erros HTTP com significado: 404, 409 (conflito), 422 (regra de negócio violada).
- Depois leia o teste `stock-movements.service.spec.ts`: o service é testado com
  um Prisma falso, sem banco.

### 4. Tratamento de erros: `common/filters/prisma-exception.filter.ts`

Exception filter global que converte erros do Prisma (ex.: violação de índice
único) em respostas HTTP úteis, em vez de um 500 genérico.

### 5. SQL puro quando faz sentido: `modules/dashboard/dashboard.service.ts`

Agregações (`SUM(quantity * cost_price)`, `GROUP BY` por dia) usando `$queryRaw`
com template string, que vira prepared statement (seguro contra SQL injection).

### 6. O front: Server Components (`web/src/app/produtos/page.tsx`)

- O componente é `async` e busca dados direto no servidor. Nada de `useEffect` + `fetch`.
- `searchParams` é uma Promise no Next 16.
- `<Suspense>` + skeletons: o cabeçalho aparece na hora e os dados chegam por streaming.
- Filtros e paginação vivem na **URL**. Dá para compartilhar o link, dar F5 e voltar.

### 7. Client Components: só onde há interatividade

Procure por `"use client"`. Estão só onde precisa: filtros com debounce,
formulários, gráfico com hover, link ativo da sidebar. Todo o resto é
renderizado no servidor e não envia JavaScript para o navegador.

### 8. Mutations com Server Actions: `web/src/features/*/actions.ts`

- Validação com zod no servidor → chamada à API → invalidação de cache → redirect ou mensagem.
- `lib/use-form-action.ts` mostra um detalhe sutil do React 19 (reset automático de formulário).
- Os formulários funcionam até sem JavaScript (progressive enhancement).

### 9. Cache: `web/src/features/categories/api.ts`

Com `cacheComponents: true`, **nada é cacheado por padrão**. Categorias usam
`'use cache'` + `cacheTag` e são invalidadas com `updateTag` depois de uma
alteração. Dados de estoque não usam cache: estão sempre frescos, e as actions
chamam `refresh()`.

### 10. Design system: `web/src/app/globals.css`

Tokens de cor como variáveis CSS, expostos ao Tailwind v4 via `@theme`.
Modo escuro automático (segue o sistema operacional). Mudar a paleta = mudar
um arquivo.

---

## Decisões e trade-offs

Escolhas que valem discutir, e o que foi considerado:

**Prisma em vez de TypeORM.** A documentação do Nest ainda mostra TypeORM,
cujo estilo de decorators combina com o Nest. Prisma venceu por ter o schema
mais legível para estudo, migrations previsíveis e tipos gerados a partir do
banco. Na versão 7 ele usa *driver adapters*; para MySQL o oficial é o
`@prisma/adapter-mariadb` (o driver mariadb é compatível com MySQL).

**Next.js falando com a API só pelo servidor.** O navegador nunca chama a API
diretamente: Server Components leem, Server Actions escrevem. A URL da API fica
privada (`server-only` impede importar `api-client.ts` num Client Component) e
não há problema de CORS. O contraponto: tudo passa pelo servidor do Next.
Para um app com muita interação em tempo real, TanStack Query no cliente seria
uma alternativa.

**Validação dos dois lados.** zod no front para mensagens imediatas e
class-validator na API como a validação que vale. Há duplicação, mas a API
nunca pode confiar no cliente. Um próximo passo seria um pacote compartilhado
com os schemas.

**Tipos da API escritos à mão no front** (`web/src/lib/types.ts`). É simples e
explícito para estudo. Em produção, gerar os tipos a partir do Swagger
(ex.: `openapi-typescript`) evita que front e API saiam de sincronia.

**Monorepo com npm workspaces, sem Turborepo/Nx.** Duas apps não justificam
mais ferramentas.

**MySQL no Docker, porta 3307.** Evita conflito com um MySQL instalado na
máquina e deixa o ambiente reproduzível.

**Sem autenticação.** Ficou de fora de propósito para manter o foco. É o
exercício mais valioso para fazer em seguida (ver abaixo).

---

## Exercícios sugeridos

Em ordem crescente de dificuldade:

1. **Fornecedores.** Crie o módulo `suppliers` na API (use `nest g resource`)
   e ligue a movimentação de entrada a um fornecedor. Exige migration, DTO,
   service, e um select novo no formulário.
2. **Estorno.** Um botão "estornar" numa movimentação cria outra movimentação
   com o delta invertido. Onde fica a regra: no front ou na API?
3. **Teste e2e.** Use `@nestjs/testing` + `supertest` para testar
   `POST /stock-movements` contra um banco de teste.
4. **Exportar CSV** do extrato com um Route Handler (`app/api/.../route.ts`).
5. **Autenticação.** JWT na API com Guards do Nest, login no Next com cookie
   httpOnly. Registre quem fez cada movimentação.
6. **Tipos gerados.** Troque `lib/types.ts` por tipos gerados do Swagger.

---

## Referência rápida da API

| Método | Rota                        | Descrição                                   |
| ------ | --------------------------- | ------------------------------------------- |
| GET    | `/categories`               | lista com contagem de produtos              |
| POST   | `/categories`               | cria                                        |
| PATCH  | `/categories/:id`           | edita                                       |
| DELETE | `/categories/:id`           | exclui (409 se tiver produtos)              |
| GET    | `/products`                 | `?search=&categoryId=&status=ok\|low\|out&archived=&page=&pageSize=` |
| GET    | `/products/:id`             | detalhe                                     |
| POST   | `/products`                 | cria (aceita `initialQuantity`)             |
| PATCH  | `/products/:id`             | edita, ou arquiva com `{ "active": false }` |
| DELETE | `/products/:id`             | exclui (409 se tiver histórico)             |
| GET    | `/stock-movements`          | `?productId=&type=&page=`                   |
| POST   | `/stock-movements`          | `{ productId, type: IN\|OUT\|ADJUSTMENT, quantity, note? }` |
| GET    | `/dashboard`                | totais, fluxo de 14 dias, itens a repor     |

Todas as rotas têm o prefixo `/api/v1`. Documentação completa em `/docs`.
