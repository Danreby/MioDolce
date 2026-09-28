"use client";

import { PlugsIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

/**
 * Error boundary da rota: captura exceções dos Server Components (ex.: API fora do ar).
 * Precisa ser Client Component porque oferece "tentar de novo" (retry busca e re-renderiza a rota).
 */
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="grid max-w-xl gap-4 py-10">
      <PlugsIcon size={32} className="text-muted" aria-hidden />
      <h1 className="text-2xl font-semibold tracking-tight">Não foi possível carregar os dados</h1>
      <p className="text-sm text-ink-2">
        A API não respondeu como esperado. Confira se o backend está rodando em{" "}
        <code className="rounded bg-sunken px-1 font-mono text-[13px]">http://localhost:5080</code> e se o MySQL
        está de pé (<code className="rounded bg-sunken px-1 font-mono text-[13px]">docker compose up -d</code>).
      </p>
      {error.digest ? <p className="font-mono text-xs text-muted">Código: {error.digest}</p> : null}
      <div>
        <Button variant="primary" onClick={() => retry()}>
          Tentar de novo
        </Button>
      </div>
    </div>
  );
}
