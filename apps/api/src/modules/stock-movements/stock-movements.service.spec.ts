import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MovementType } from '../../generated/prisma/enums.js';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { computeDelta, StockMovementsService } from './stock-movements.service.js';

describe('computeDelta', () => {
  it('entrada soma, saída subtrai', () => {
    expect(computeDelta(MovementType.IN, 5, 10)).toBe(5);
    expect(computeDelta(MovementType.OUT, 3, 10)).toBe(-3);
  });

  it('ajuste devolve a diferença entre contado e atual', () => {
    expect(computeDelta(MovementType.ADJUSTMENT, 7, 10)).toBe(-3);
    expect(computeDelta(MovementType.ADJUSTMENT, 12, 10)).toBe(2);
  });
});

/**
 * Teste unitário: o service é instanciado com `new` e um Prisma falso.
 * Nada de banco real, então roda em milissegundos. O fake de `$transaction`
 * só executa o callback passando o próprio "tx".
 */
describe('StockMovementsService.create', () => {
  const product = { id: 1, quantity: 10, active: true };

  function setup(overrides: { product?: object | null; updated?: number } = {}) {
    const tx = {
      product: {
        findUnique: vi.fn().mockResolvedValue(overrides.product === undefined ? product : overrides.product),
        updateMany: vi.fn().mockResolvedValue({ count: overrides.updated ?? 1 }),
      },
      stockMovement: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 99, ...data })),
      },
    };
    const prisma = { $transaction: (fn: (t: typeof tx) => unknown) => fn(tx) };
    const service = new StockMovementsService(prisma as unknown as PrismaService);
    return { service, tx };
  }

  it('registra a saída e grava o saldo resultante', async () => {
    const { service, tx } = setup();

    const movement = await service.create({ productId: 1, type: MovementType.OUT, quantity: 4 });

    expect(movement).toMatchObject({ delta: -4, balanceAfter: 6 });
    // Optimistic lock: o update só vale se o saldo ainda for 10.
    expect(tx.product.updateMany).toHaveBeenCalledWith({
      where: { id: 1, quantity: 10 },
      data: { quantity: 6 },
    });
  });

  it('bloqueia saída maior que o saldo', async () => {
    const { service, tx } = setup();

    await expect(
      service.create({ productId: 1, type: MovementType.OUT, quantity: 11 }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(tx.stockMovement.create).not.toHaveBeenCalled();
  });

  it('retorna 409 quando outra operação alterou o saldo no meio do caminho', async () => {
    const { service } = setup({ updated: 0 });

    await expect(
      service.create({ productId: 1, type: MovementType.IN, quantity: 1 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejeita produto inexistente, arquivado ou ajuste sem diferença', async () => {
    await expect(
      setup({ product: null }).service.create({ productId: 1, type: MovementType.IN, quantity: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      setup({ product: { ...product, active: false } }).service.create({ productId: 1, type: MovementType.IN, quantity: 1 }),
    ).rejects.toBeInstanceOf(ConflictException);

    await expect(
      setup().service.create({ productId: 1, type: MovementType.ADJUSTMENT, quantity: 10 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('exige quantidade positiva em entradas', async () => {
    await expect(
      setup().service.create({ productId: 1, type: MovementType.IN, quantity: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
