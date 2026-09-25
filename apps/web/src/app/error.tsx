"use client"; // Error boundaries precisam ser Client Components.

import { useEffect } from "react";
import { WarningOctagonIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

/**
 * Captura erros não tratados das páginas (ex.: API fora do ar).
 * Em produção o Next esconde a mensagem real e manda só um `digest`.
 */
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="border-line bg-panel mt-4 flex max-w-xl flex-col items-start gap-4 rounded-xs border p-8">
      <WarningOctagonIcon size={32} className="text-danger" />
      <div>
        <h1 className="display text-2xl font-bold">Não foi possível carregar esta tela</h1>
        <p className="text-ink-2 mt-2 text-sm">{error.message || "Erro inesperado."}</p>
        {error.digest && <p className="text-muted mt-1 font-mono text-xs">ref. {error.digest}</p>}
      </div>
      <Button variant="primary" onClick={() => retry()}>
        Tentar de novo
      </Button>
    </div>
  );
}
