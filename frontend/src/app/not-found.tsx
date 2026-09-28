import { MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid max-w-xl gap-4 py-10">
      <MagnifyingGlassIcon size={32} className="text-muted" aria-hidden />
      <h1 className="text-2xl font-semibold tracking-tight">Não encontramos esta página</h1>
      <p className="text-sm text-ink-2">O endereço pode estar errado ou o registro foi excluído.</p>
      <div>
        <ButtonLink href="/produtos">Ir para produtos</ButtonLink>
      </div>
    </div>
  );
}
