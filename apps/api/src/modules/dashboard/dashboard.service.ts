import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

const FLOW_DAYS = 14;

interface TotalsRow {
  products: bigint;
  units: bigint | null;
  value: unknown; // Decimal
  outOfStock: bigint | null;
  lowStock: bigint | null;
}

interface FlowRow {
  day: Date;
  inbound: bigint;
  outbound: bigint;
}

/**
 * Agregações que o query builder não expressa bem (SUM de colunas
 * multiplicadas, GROUP BY por dia) usam SQL puro via `$queryRaw`.
 * Os valores `${...}` viram parâmetros do prepared statement: não há
 * concatenação de string, portanto não há SQL injection.
 */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [totals, flow, lowStockItems, recentMovements] = await Promise.all([
      this.totals(),
      this.flow(),
      this.prisma.product.findMany({
        where: { active: true, quantity: { lte: this.prisma.product.fields.minQuantity } },
        select: { id: true, sku: true, name: true, unit: true, quantity: true, minQuantity: true },
        orderBy: { quantity: 'asc' },
        take: 6,
      }),
      this.prisma.stockMovement.findMany({
        include: { product: { select: { id: true, sku: true, name: true, unit: true } } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 8,
      }),
    ]);

    return { totals, flow, lowStockItems, recentMovements };
  }

  private async totals() {
    const [row] = await this.prisma.$queryRaw<TotalsRow[]>`
      SELECT
        COUNT(*)                                           AS products,
        SUM(quantity)                                      AS units,
        CAST(COALESCE(SUM(quantity * cost_price), 0) AS DECIMAL(14, 2)) AS value,
        SUM(quantity = 0)                                  AS outOfStock,
        SUM(quantity > 0 AND quantity <= min_quantity)     AS lowStock
      FROM products
      WHERE active = 1
    `;

    return {
      products: Number(row.products),
      units: Number(row.units ?? 0),
      inventoryValue: String(row.value),
      outOfStock: Number(row.outOfStock ?? 0),
      lowStock: Number(row.lowStock ?? 0),
    };
  }

  /** Entradas e saídas por dia nos últimos 14 dias, incluindo dias sem movimento. */
  private async flow() {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (FLOW_DAYS - 1));

    const rows = await this.prisma.$queryRaw<FlowRow[]>`
      SELECT
        DATE(created_at)                                  AS day,
        SUM(CASE WHEN delta > 0 THEN delta ELSE 0 END)    AS inbound,
        SUM(CASE WHEN delta < 0 THEN -delta ELSE 0 END)   AS outbound
      FROM stock_movements
      WHERE created_at >= ${since}
      GROUP BY DATE(created_at)
    `;

    const byDay = new Map(rows.map((r) => [toDay(new Date(r.day)), r]));

    return Array.from({ length: FLOW_DAYS }, (_, i) => {
      const date = new Date(since);
      date.setUTCDate(since.getUTCDate() + i);
      const day = toDay(date);
      const row = byDay.get(day);
      return { day, inbound: Number(row?.inbound ?? 0), outbound: Number(row?.outbound ?? 0) };
    });
  }
}

const toDay = (date: Date) => date.toISOString().slice(0, 10);
