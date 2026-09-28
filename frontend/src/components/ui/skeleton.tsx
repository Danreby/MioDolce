/** Bloco de carregamento com o MESMO formato do conteúdo final (evita salto de layout). */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-md bg-sunken ${className}`} />;
}
