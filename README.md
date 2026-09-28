# MioDolce · Estoque

Sistema simples de gerenciamento de estoque, feito para **estudar ASP.NET Core** (foco principal) e **Next.js**.
O cenário é o almoxarifado de uma confeitaria: produtos, categorias e um livro-razão de movimentações
(entradas, saídas e ajustes de inventário).

| Camada   | Tecnologia                                                                  |
| -------- | --------------------------------------------------------------------------- |
| Backend  | ASP.NET Core 10 (LTS), Minimal APIs, EF Core 10, FluentValidation, OpenAPI + Scalar |
| Banco    | MySQL 8.4 LTS (Docker), provider oficial `MySql.EntityFrameworkCore`        |
| Frontend | Next.js 16 (App Router, Server Components, Server Actions), React 19, Tailwind CSS v4 |
| Testes   | xUnit v3 + Microsoft Testing Platform, WebApplicationFactory, Testcontainers |

## Como rodar

### Pré-requisitos

- **.NET 10 SDK**: `winget install Microsoft.DotNet.SDK.10`
  (confira com `dotnet --list-sdks`; precisa aparecer uma versão `10.0.x`)
- **Node.js 20+** (o projeto foi feito com Node 24)
- **Docker Desktop** (para o MySQL)

### 1. Banco de dados

```bash
docker compose up -d
```

Sobe um MySQL 8.4 na porta **3307** do host (a 3306 costuma estar ocupada por um MySQL local).
Usuário `miodolce`, senha `miodolce_dev`, banco `miodolce`.

### 2. API (.NET)

```bash
cd backend
dotnet run --project src/MioDolce.Api
```

Na primeira execução a API **aplica as migrations e popula o banco** com dados de exemplo.

- Documentação interativa (Scalar): http://localhost:5080/scalar
- OpenAPI JSON: http://localhost:5080/openapi/v1.json
- Health check: http://localhost:5080/health
- Requisições prontas para testar: [backend/src/MioDolce.Api/MioDolce.Api.http](backend/src/MioDolce.Api/MioDolce.Api.http)

### 3. Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local   # só na primeira vez
npm run dev
```

Abra http://localhost:3000.

### Testes

```bash
cd backend
dotnet test                                           # tudo (integração precisa do Docker rodando)
dotnet test --project tests/MioDolce.Domain.Tests     # só os testes rápidos do domínio
```

```bash
cd frontend
npm run lint
npx tsc --noEmit
```

### Comandos úteis

```bash
# Nova migration depois de mudar uma entidade/configuração (rode dentro de backend/)
dotnet tool restore
dotnet ef migrations add NomeDaMudanca --project src/MioDolce.Infrastructure --startup-project src/MioDolce.Api --output-dir Persistence/Migrations

# Ver o SQL que as migrations geram
dotnet ef migrations script --project src/MioDolce.Infrastructure --startup-project src/MioDolce.Api

# Zerar o banco (apaga o volume; a API recria e popula na próxima execução)
docker compose down -v && docker compose up -d
```

## Estrutura

```
MioDolce/
├─ docker-compose.yml           MySQL 8.4
├─ docs/                        guias de estudo (comece por aqui)
├─ backend/
│  ├─ MioDolce.slnx             solução (formato novo, XML)
│  ├─ Directory.Build.props     configurações comuns a todos os projetos
│  ├─ Directory.Packages.props  versões de pacotes centralizadas
│  ├─ src/
│  │  ├─ MioDolce.Domain/          regras de negócio puras (entidades, Result, erros)
│  │  ├─ MioDolce.Application/     casos de uso, contratos (DTOs), validação
│  │  ├─ MioDolce.Infrastructure/  EF Core + MySQL, migrations, seed
│  │  └─ MioDolce.Api/             endpoints HTTP, DI, middlewares
│  └─ tests/
│     ├─ MioDolce.Domain.Tests/          testes de unidade
│     └─ MioDolce.Api.IntegrationTests/  API real + MySQL em container
└─ frontend/
   └─ src/
      ├─ app/          rotas (cada pasta = uma URL)
      ├─ features/     código por assunto: produtos, categorias, movimentações, painel
      ├─ components/   UI reutilizável (botões, campos, layout)
      └─ lib/          cliente HTTP, formatação, helpers
```

## Guias de estudo

1. [Arquitetura e o caminho de uma requisição](docs/01-arquitetura.md)
2. [ASP.NET Core: conceito por conceito, com o arquivo onde ele aparece](docs/02-guia-aspnet.md)
3. [Next.js: como o frontend conversa com a API](docs/03-guia-nextjs.md)
4. [Decisões técnicas e por quê](docs/04-decisoes.md)
5. [Exercícios para praticar](docs/05-exercicios.md)
