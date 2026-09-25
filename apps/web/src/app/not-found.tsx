import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mt-4 flex max-w-xl flex-col items-start gap-4">
      <p className="text-muted font-mono text-sm">404</p>
      <h1 className="display text-3xl font-bold">Esta página não existe</h1>
      <p className="text-ink-2 text-sm">O item pode ter sido excluído, ou o endereço está errado.</p>
      <ButtonLink href="/produtos" variant="primary">
        Ver produtos
      </ButtonLink>
    </div>
  );
}
