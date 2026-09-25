"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatDay, formatInt } from "@/lib/format";
import type { DashboardSummary } from "@/lib/types";

type Flow = DashboardSummary["flow"];

/** Arredonda o topo da escala para um número "limpo" (50, 100, 250...). */
function niceMax(value: number) {
  if (value <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value)!;
  return step * magnitude;
}

/**
 * Colunas espelhadas: entradas crescem para cima, saídas para baixo, a
 * partir do mesmo eixo. A posição já diz a direção; a cor só reforça.
 * Client Component por causa do estado de hover/foco.
 */
export function FlowChart({ flow }: { flow: Flow }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...flow.map((d) => Math.max(d.inbound, d.outbound))));
  const peakIn = flow.reduce((best, d, i) => (d.inbound > flow[best].inbound ? i : best), 0);
  const peakOut = flow.reduce((best, d, i) => (d.outbound > flow[best].outbound ? i : best), 0);
  const pct = (v: number) => `${(v / max) * 100}%`;

  return (
    <figure>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
        <LegendItem className="bg-flow-in" label="Entradas" />
        <LegendItem className="bg-flow-out" label="Saídas" />
      </div>

      <div className="relative grid grid-cols-[auto_1fr] gap-x-3">
        {/* Eixo Y: mesma escala para cima e para baixo. */}
        <div className="text-muted tabular flex h-64 flex-col justify-between text-right font-mono text-[10px] leading-none">
          <span>{formatInt(max)}</span>
          <span>0</span>
          <span>{formatInt(max)}</span>
        </div>

        <div className="relative h-64" onMouseLeave={() => setActive(null)}>
          {/* Grade discreta: topo, eixo central e base. */}
          <div aria-hidden className="border-line absolute inset-x-0 top-0 border-t" />
          <div aria-hidden className="bg-line-strong absolute inset-x-0 top-1/2 h-px" />
          <div aria-hidden className="border-line absolute inset-x-0 bottom-0 border-t" />

          <ol className="relative grid h-full" style={{ gridTemplateColumns: `repeat(${flow.length}, minmax(0, 1fr))` }}>
            {flow.map((d, i) => (
              <li
                key={d.day}
                tabIndex={0}
                aria-label={`${formatDay(d.day)}: ${d.inbound} entradas, ${d.outbound} saídas`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className={cn("group relative h-full outline-none", active === i && "bg-sunken/70")}
              >
                {/* metade de cima: entradas */}
                <div className="absolute inset-x-0 top-0 flex h-1/2 items-end justify-center pb-px">
                  <div className="bg-flow-in relative w-[min(24px,60%)] rounded-t-[4px]" style={{ height: pct(d.inbound) }}>
                    {i === peakIn && d.inbound > 0 && (
                      <span className="text-ink tabular absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[10px] font-semibold">
                        {formatInt(d.inbound)}
                      </span>
                    )}
                  </div>
                </div>
                {/* metade de baixo: saídas */}
                <div className="absolute inset-x-0 bottom-0 flex h-1/2 items-start justify-center pt-px">
                  <div className="bg-flow-out relative w-[min(24px,60%)] rounded-b-[4px]" style={{ height: pct(d.outbound) }}>
                    {i === peakOut && d.outbound > 0 && (
                      <span className="text-ink tabular absolute -bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] font-semibold">
                        {formatInt(d.outbound)}
                      </span>
                    )}
                  </div>
                </div>

                {active === i && <Tooltip day={d} alignRight={i > flow.length / 2} />}
              </li>
            ))}
          </ol>
        </div>

        {/* Eixo X: datas, uma sim outra não para não embolar. */}
        <div />
        <div className="text-muted tabular mt-2 grid font-mono text-[10px]" style={{ gridTemplateColumns: `repeat(${flow.length}, minmax(0, 1fr))` }}>
          {flow.map((d, i) => (
            <span key={d.day} className="text-center">
              {i % 2 === flow.length % 2 ? formatDay(d.day) : ""}
            </span>
          ))}
        </div>
      </div>

      <details className="mt-5 text-sm">
        <summary className="text-ink-2 hover:text-ink cursor-pointer select-none">Ver como tabela</summary>
        <table className="mt-3 w-full max-w-md text-sm">
          <thead className="text-muted text-left text-xs">
            <tr>
              <th scope="col" className="py-1 font-medium">Dia</th>
              <th scope="col" className="py-1 text-right font-medium">Entradas</th>
              <th scope="col" className="py-1 text-right font-medium">Saídas</th>
            </tr>
          </thead>
          <tbody className="tabular font-mono">
            {flow.map((d) => (
              <tr key={d.day} className="border-line border-t">
                <td className="py-1">{formatDay(d.day)}</td>
                <td className="py-1 text-right">{formatInt(d.inbound)}</td>
                <td className="py-1 text-right">{formatInt(d.outbound)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span className="text-ink-2 inline-flex items-center gap-1.5">
      <span aria-hidden className={cn("size-2.5 rounded-[2px]", className)} />
      {label}
    </span>
  );
}

function Tooltip({ day, alignRight }: { day: Flow[number]; alignRight: boolean }) {
  const net = day.inbound - day.outbound;
  return (
    <div
      role="tooltip"
      className={cn(
        "border-line-strong bg-panel pointer-events-none absolute top-2 z-10 w-40 rounded-xs border p-3 text-xs shadow-[0_6px_20px_-8px_rgb(22_25_28/0.35)]",
        alignRight ? "right-full mr-1" : "left-full ml-1",
      )}
    >
      <p className="mb-2 font-semibold">{formatDay(day.day)}</p>
      <Row swatch="bg-flow-in" label="Entradas" value={formatInt(day.inbound)} />
      <Row swatch="bg-flow-out" label="Saídas" value={formatInt(day.outbound)} />
      <p className="border-line text-ink-2 mt-2 flex justify-between border-t pt-2">
        Líquido <span className="text-ink tabular font-mono font-semibold">{net > 0 ? `+${net}` : net}</span>
      </p>
    </div>
  );
}

function Row({ swatch, label, value }: { swatch: string; label: string; value: string }) {
  return (
    <p className="text-ink-2 flex items-center justify-between py-0.5">
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden className={cn("size-2 rounded-[2px]", swatch)} />
        {label}
      </span>
      <span className="text-ink tabular font-mono">{value}</span>
    </p>
  );
}
