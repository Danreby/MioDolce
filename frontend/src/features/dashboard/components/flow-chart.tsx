"use client";

import { useState } from "react";
import { formatDay, formatMoney, formatMoneyCompact, formatWeekday } from "@/lib/format";
import type { DailyFlow } from "../types";

const HALF = 88; // altura (px) de cada metade: entradas acima da linha, saídas abaixo

/**
 * Colunas divergentes: entradas crescem para cima e saídas para baixo a partir de uma
 * única linha de base (polaridade). Uma escala só para as duas metades, então as alturas
 * são comparáveis. Hover/foco mostra o detalhe do dia; a tabela abaixo dá acesso sem gráfico.
 */
export function FlowChart({ data }: { data: DailyFlow[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceCeil(Math.max(1, ...data.flatMap((d) => [d.entriesValue, d.exitsValue])));
  const current = active === null ? null : data[active];

  return (
    <figure className="grid gap-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-2">
        <Legend swatch="bg-flow-in" label="Entradas" />
        <Legend swatch="bg-flow-out" label="Saídas" />
        <span className="text-muted">valor a custo, por dia</span>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-x-3">
        {/* Eixo Y: só três marcas limpas (máximo, zero, máximo). */}
        <div className="tabular flex flex-col justify-between text-right text-xs text-muted" style={{ height: HALF * 2 }}>
          <span className="-translate-y-1/2">{formatMoneyCompact(max)}</span>
          <span>0</span>
          <span className="translate-y-1/2">{formatMoneyCompact(max)}</span>
        </div>

        <div className="relative" onMouseLeave={() => setActive(null)}>
          <div className="absolute inset-x-0 top-0 h-px bg-line" />
          <div className="absolute inset-x-0 h-px bg-line-strong" style={{ top: HALF }} />
          <div className="absolute inset-x-0 h-px bg-line" style={{ top: HALF * 2 }} />

          <ol className="relative flex" style={{ height: HALF * 2 }}>
            {data.map((day, index) => (
              <li key={day.date} className="flex-1">
                <button
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onBlur={() => setActive(null)}
                  aria-label={`${formatWeekday(day.date)}: entradas ${formatMoney(day.entriesValue)}, saídas ${formatMoney(day.exitsValue)}`}
                  className={
                    "flex h-full w-full flex-col items-center rounded-sm outline-offset-0 transition-colors " +
                    (active === index ? "bg-sunken/70" : "")
                  }
                >
                  {/* 2px de respiro separa cada barra da linha de base. */}
                  <span className="flex w-full flex-1 items-end justify-center pb-px">
                    <span
                      className="w-[min(18px,60%)] rounded-t-[4px] bg-flow-in"
                      style={{ height: `${(day.entriesValue / max) * 100}%` }}
                    />
                  </span>
                  <span className="flex w-full flex-1 items-start justify-center pt-px">
                    <span
                      className="w-[min(18px,60%)] rounded-b-[4px] bg-flow-out"
                      style={{ height: `${(day.exitsValue / max) * 100}%` }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>

          {current && active !== null ? (
            <div
              role="status"
              className="pointer-events-none absolute top-2 z-10 grid w-52 gap-1 rounded-md border border-line bg-surface p-3 text-sm shadow-lg shadow-ink/10"
              style={{
                left: `clamp(0px, calc(${((active + 0.5) / data.length) * 100}% - 104px), calc(100% - 208px))`,
              }}
            >
              <p className="font-medium capitalize text-ink">{formatWeekday(current.date)}</p>
              <TooltipRow swatch="bg-flow-in" label="Entradas" value={current.entriesValue} />
              <TooltipRow swatch="bg-flow-out" label="Saídas" value={current.exitsValue} />
            </div>
          ) : null}

          <div className="tabular mt-2 flex text-xs text-muted">
            {data.map((day, index) => (
              <span key={day.date} className="flex-1 text-center">
                {index === data.length - 1 ? "hoje" : index % 3 === 0 ? formatDay(day.date) : ""}
              </span>
            ))}
          </div>
        </div>
      </div>

      <details className="text-sm">
        <summary className="w-fit cursor-pointer text-ink-2 hover:text-ink">Ver dados em tabela</summary>
        <table className="tabular mt-3 w-full max-w-md text-left">
          <thead className="text-muted">
            <tr>
              <th className="py-1 font-normal">Dia</th>
              <th className="py-1 text-right font-normal">Entradas</th>
              <th className="py-1 text-right font-normal">Saídas</th>
            </tr>
          </thead>
          <tbody>
            {data.map((day) => (
              <tr key={day.date} className="border-t border-line">
                <td className="py-1">{formatDay(day.date)}</td>
                <td className="py-1 text-right">{formatMoney(day.entriesValue)}</td>
                <td className="py-1 text-right">{formatMoney(day.exitsValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-2.5 rounded-[3px] ${swatch}`} aria-hidden />
      {label}
    </span>
  );
}

function TooltipRow({ swatch, label, value }: { swatch: string; label: string; value: number }) {
  return (
    <p className="flex items-center justify-between gap-3 text-ink-2">
      <span className="inline-flex items-center gap-2">
        <span className={`size-2 rounded-[2px] ${swatch}`} aria-hidden />
        {label}
      </span>
      <span className="tabular text-ink">{formatMoney(value)}</span>
    </p>
  );
}

/** Arredonda para um número "limpo" de eixo: 1, 2, 2.5, 5 ou 10 vezes uma potência de 10. */
function niceCeil(value: number) {
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power >= value) ?? 10;
  return step * power;
}
