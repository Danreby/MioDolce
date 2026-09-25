/**
 * Popula o banco com dados de exemplo: `npm run db:seed` (na raiz).
 * Apaga tudo antes, então rode só em desenvolvimento.
 */
import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { MovementType, Unit } from '../src/generated/prisma/enums.js';

const url = new URL(process.env.DATABASE_URL!);
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    allowPublicKeyRetrieval: true,
  }),
});

// Gerador pseudoaleatório com semente fixa: o seed gera sempre os mesmos dados.
let state = 42;
const random = () => ((state = (state * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const between = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;

const categories = [
  { name: 'Elétrica', description: 'Fios, disjuntores, tomadas e iluminação' },
  { name: 'Hidráulica', description: 'Tubos, conexões e registros' },
  { name: 'Ferramentas', description: 'Manuais e elétricas' },
  { name: 'Fixação', description: 'Parafusos, buchas e pregos' },
  { name: 'Pintura', description: 'Tintas, rolos e acessórios' },
];

type SeedProduct = [sku: string, name: string, category: string, unit: Unit, cost: number, sale: number, min: number, start: number];

const products: SeedProduct[] = [
  ['ELE-CAB-25', 'Cabo flexível 2,5 mm² rolo 100 m', 'Elétrica', Unit.UN, 189.9, 259.0, 8, 22],
  ['ELE-DJ-20', 'Disjuntor unipolar 20 A', 'Elétrica', Unit.UN, 11.4, 19.9, 30, 64],
  ['ELE-TOM-10', 'Tomada 2P+T 10 A branca', 'Elétrica', Unit.UN, 6.8, 12.5, 40, 35],
  ['ELE-LED-9', 'Lâmpada LED bulbo 9 W 6500 K', 'Elétrica', Unit.CX, 48.0, 79.9, 10, 18],
  ['ELE-FITA-20', 'Fita isolante 20 m preta', 'Elétrica', Unit.UN, 3.2, 6.9, 50, 140],
  ['HID-TUB-25', 'Tubo PVC soldável 25 mm barra 6 m', 'Hidráulica', Unit.UN, 17.3, 28.9, 20, 48],
  ['HID-JOE-25', 'Joelho 90° soldável 25 mm', 'Hidráulica', Unit.PCT, 12.6, 21.0, 15, 9],
  ['HID-REG-34', 'Registro de gaveta 3/4"', 'Hidráulica', Unit.UN, 38.5, 64.9, 6, 11],
  ['HID-VED-18', 'Fita veda-rosca 18 mm x 25 m', 'Hidráulica', Unit.UN, 2.9, 5.5, 30, 76],
  ['FER-FUR-650', 'Furadeira de impacto 650 W', 'Ferramentas', Unit.UN, 212.0, 329.0, 3, 5],
  ['FER-TRE-5', 'Trena emborrachada 5 m', 'Ferramentas', Unit.UN, 14.7, 27.9, 10, 24],
  ['FER-CHV-KIT', 'Jogo de chaves de fenda e Phillips 6 peças', 'Ferramentas', Unit.KIT, 29.9, 54.9, 8, 3],
  ['FER-ALI-8', 'Alicate universal 8"', 'Ferramentas', Unit.UN, 24.3, 42.0, 8, 14],
  ['FIX-PAR-4X40', 'Parafuso chipboard 4,0 x 40 mm (cx 500)', 'Fixação', Unit.CX, 31.5, 52.9, 12, 27],
  ['FIX-BUC-6', 'Bucha de nylon 6 mm (pct 100)', 'Fixação', Unit.PCT, 7.4, 13.9, 25, 58],
  ['FIX-PRE-17', 'Prego 17 x 27 com cabeça 1 kg', 'Fixação', Unit.PCT, 13.8, 22.5, 15, 0],
  ['PIN-LAT-18', 'Tinta acrílica fosca branco neve 18 L', 'Pintura', Unit.UN, 219.0, 339.9, 4, 7],
  ['PIN-ROL-23', 'Rolo de lã 23 cm com cabo', 'Pintura', Unit.UN, 16.2, 29.9, 10, 31],
  ['PIN-FIT-48', 'Fita crepe 48 mm x 50 m', 'Pintura', Unit.UN, 8.9, 15.9, 20, 16],
  ['PIN-LIX-120', 'Lixa d\'água grão 120', 'Pintura', Unit.UN, 1.4, 2.9, 60, 210],
];

const DAY = 24 * 60 * 60 * 1000;

async function main() {
  // Ordem importa por causa das foreign keys.
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  await prisma.category.createMany({ data: categories });
  const categoryIds = new Map(
    (await prisma.category.findMany()).map((c) => [c.name, c.id] as const),
  );

  for (const [sku, name, category, unit, costPrice, salePrice, minQuantity, start] of products) {
    // Histórico dos últimos 14 dias: saldo inicial + entradas e saídas aleatórias.
    const movements: { type: MovementType; delta: number; balanceAfter: number; note: string; createdAt: Date }[] = [];
    let balance = start;
    const origin = Date.now() - 15 * DAY;
    if (start > 0) {
      movements.push({ type: MovementType.IN, delta: start, balanceAfter: start, note: 'Saldo inicial', createdAt: new Date(origin) });
    }

    for (let day = 1; day <= 14; day++) {
      if (random() < 0.45) continue;
      const at = new Date(origin + day * DAY + between(8, 18) * 60 * 60 * 1000);
      if (random() < 0.3 || balance < minQuantity) {
        const qty = between(minQuantity, minQuantity * 2 + 5);
        balance += qty;
        movements.push({ type: MovementType.IN, delta: qty, balanceAfter: balance, note: 'Reposição de fornecedor', createdAt: at });
      } else if (balance > 0) {
        const qty = Math.min(balance, between(1, Math.max(2, Math.ceil(balance / 4))));
        balance -= qty;
        movements.push({ type: MovementType.OUT, delta: -qty, balanceAfter: balance, note: 'Venda balcão', createdAt: at });
      }
    }

    // Alguns itens terminam abaixo do mínimo para o dashboard ter o que mostrar.
    if (['FER-CHV-KIT', 'HID-JOE-25', 'FIX-PRE-17'].includes(sku) && balance > 0) {
      const qty = balance - between(0, 2);
      if (qty > 0) {
        balance -= qty;
        movements.push({ type: MovementType.OUT, delta: -qty, balanceAfter: balance, note: 'Venda para obra', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) });
      }
    }

    await prisma.product.create({
      data: {
        sku,
        name,
        unit,
        costPrice,
        salePrice,
        minQuantity,
        quantity: balance,
        categoryId: categoryIds.get(category)!,
        movements: { create: movements },
      },
    });
  }

  const [p, m] = await Promise.all([prisma.product.count(), prisma.stockMovement.count()]);
  console.log(`Seed concluído: ${categories.length} categorias, ${p} produtos, ${m} movimentações.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
