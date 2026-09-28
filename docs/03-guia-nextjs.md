# 3. Guia de Next.js (App Router)

## 3.1 Rotas são pastas

```
src/app/
  page.tsx                    →  /                (painel)
  produtos/page.tsx           →  /produtos
  produtos/novo/page.tsx      →  /produtos/novo
  produtos/[id]/page.tsx      →  /produtos/123    ([id] = segmento dinâmico)
  produtos/[id]/editar/...    →  /produtos/123/editar
  categorias/page.tsx         →  /categorias
  movimentacoes/page.tsx      →  /movimentacoes
```

Arquivos especiais: `layout.tsx` (moldura comum), `loading.tsx` (esqueleto enquanto carrega),
`error.tsx` (erro inesperado), `not-found.tsx` (404).

## 3.2 Server Components: buscar dados sem useEffect

Todo componente é **Server Component** por padrão. Ele roda no servidor, pode ser `async` e
chama a API diretamente:

```tsx
export default async function DashboardPage() {
  const data = await dashboardApi.get();   // roda no servidor
  return <p>{formatMoney(data.inventoryValue)}</p>;
}
```

Veja [app/page.tsx](../frontend/src/app/page.tsx). Sem `useEffect`, sem estado de carregamento
manual: o `loading.tsx` aparece enquanto espera.

Chamadas independentes rodam em paralelo com `Promise.all` ([produtos/page.tsx](../frontend/src/app/produtos/page.tsx)).

## 3.3 Client Components: só onde precisa

`"use client"` no topo do arquivo marca um componente que roda também no navegador. Use só quando
precisar de estado, eventos ou APIs do browser. Neste projeto são poucos:

| Componente | Por que é client |
| --- | --- |
| [nav-link.tsx](../frontend/src/components/layout/nav-link.tsx) | `usePathname` (rota atual) |
| [flow-chart.tsx](../frontend/src/features/dashboard/components/flow-chart.tsx) | hover e foco no gráfico |
| formulários (`*-form.tsx`) | `useActionState` |
| [submit-button.tsx](../frontend/src/components/ui/submit-button.tsx) | `useFormStatus` |
| [error.tsx](../frontend/src/app/error.tsx) | botão "tentar de novo" |

Repare no [app-header.tsx](../frontend/src/components/layout/app-header.tsx): o cabeçalho é Server
Component e só o pedaço que precisa do navegador (`NavLink`) é client.

## 3.4 `server-only`: o segredo não vaza

[lib/env.ts](../frontend/src/lib/env.ts) e [lib/api/client.ts](../frontend/src/lib/api/client.ts)
começam com `import "server-only"`. Se alguém importar esses arquivos num Client Component, **o build
quebra**. É a garantia de que a URL da API e a lógica de acesso nunca vão para o navegador.
O `env.ts` ainda valida as variáveis com **zod** na inicialização.

## 3.5 Server Actions: gravar dados

Uma função com `"use server"` roda no servidor e pode ser passada direto para `<form action>`:

```
<form action={formAction}>        ← movement-form.tsx (client)
        │
        ▼
registerMovement(prevState, formData)   ← movements/actions.ts ("use server")
        │  chama a API .NET
        ▼
revalidatePath(...)  →  a página é re-renderizada com dados novos
redirect(...)        →  ou navega para outra página
```

- **`useActionState(action, estadoInicial)`** devolve `[state, formAction]`. O `state` é o que a
  action retornou: erros por campo, mensagem, valores digitados ([lib/form-state.ts](../frontend/src/lib/form-state.ts)).
- **Os erros de validação vêm da API.** O ASP.NET devolve
  `{ errors: { "name": ["'Nome' deve ser informado."] } }` e [lib/forms.ts](../frontend/src/lib/forms.ts)
  converte isso em erros por campo. Uma única fonte da verdade para as regras.
- **`redirect()` fica fora do `try/catch`**: ele funciona lançando uma exceção de controle.

### Pegadinha do React 19 (bug real deste projeto)

Depois que uma Server Action termina, **o React reseta o `<form>` automaticamente**. No formulário
de movimentação, os radios "Entrada/Saída/Ajuste" eram *controlados* (`checked={...}`). O reset
voltava o DOM para "Entrada", mas o estado do React continuava "Saída": o botão dizia
"Registrar saída" e o formulário enviava uma **entrada**. A correção foi usar `defaultChecked`
acompanhando o estado. Detalhes no comentário em
[movement-form.tsx](../frontend/src/features/movements/components/movement-form.tsx).

Pelo mesmo motivo, os campos usam `defaultValue={state.values?.campo ?? ...}`: após um erro,
o reset restaura o que o usuário tinha digitado.

## 3.6 Estado na URL

Filtros, página e "categoria em edição" ficam na **query string**, não em `useState`:

- `/produtos?status=Low&sort=LowestStock&page=2`
- `/categorias?editar=<id>`

Vantagens: dá para compartilhar o link, o botão voltar funciona e o Server Component lê tudo de
`searchParams`. Os filtros de produto são um `<form>` GET comum ([product-filters.tsx](../frontend/src/features/products/components/product-filters.tsx)).
Helpers em [lib/search-params.ts](../frontend/src/lib/search-params.ts).

No Next 16, `params` e `searchParams` são **Promises** (`await searchParams`), e o tipo
`PageProps<"/produtos/[id]">` é **gerado** a partir das pastas (`npx next typegen`).

## 3.7 `cache()` e not-found

[load-product.ts](../frontend/src/features/products/load-product.ts) usa `cache()` do React: a página e o
`generateMetadata` pedem o mesmo produto, mas a API é chamada **uma vez** por renderização.
Um 404 da API vira `notFound()`.

Detalhe do Next 16: como a rota tem `loading.tsx` (streaming), a resposta já começou com status 200
quando o `notFound()` acontece. A página certa aparece e ganha `noindex`, mas o status HTTP fica 200
("soft 404"). Para um 404 real, a checagem teria que acontecer antes do streaming (no `proxy`).

## 3.8 Tailwind CSS v4 e tokens de design

[globals.css](../frontend/src/app/globals.css):

- As cores são **variáveis CSS** (`--ink`, `--surface`, `--accent`...) redefinidas dentro de
  `@media (prefers-color-scheme: dark)`. Os componentes usam sempre `bg-surface`, `text-ink`...
  e o modo escuro funciona sem nenhum `dark:` espalhado.
- `@theme inline` expõe essas variáveis como classes do Tailwind.
- Um único acento (pistache). Âmbar e vermelho são **reservados** para estado do estoque, sempre com ícone + texto.
- As cores do gráfico foram validadas para daltonismo e contraste nos dois modos.

## 3.9 Organização do código

```
src/
  app/          só rotas: buscam dados e montam a página
  features/     um diretório por assunto
    products/
      types.ts      tipos espelhando os DTOs da API
      labels.ts     traduções (a API fala inglês, a UI fala português)
      api.ts        uma função por endpoint (server-only)
      actions.ts    Server Actions
      components/   componentes específicos do assunto
  components/   UI genérica (ui/) e moldura (layout/)
  lib/          utilitários sem regra de negócio
```

Um componente de `features/products` pode usar `components/ui`, mas `components/ui` nunca importa de `features/`.
