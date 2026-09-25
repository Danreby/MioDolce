import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { MovementType } from '../../generated/prisma/enums.js';
import { paginate } from '../../common/dto/pagination-query.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto.js';
import { ListStockMovementsQueryDto } from './dto/list-stock-movements-query.dto.js';

const withProduct = { product: { select: { id: true, sku: true, name: true, unit: true } } } as const;

/**
 * Converte o pedido do usuário na variação real do saldo.
 * Função pura (sem banco), fácil de testar isoladamente.
 */
export function computeDelta(type: MovementType, quantity: number, currentBalance: number): number {
  switch (type) {
    case MovementType.IN:
      return quantity;
    case MovementType.OUT:
      return -quantity;
    case MovementType.ADJUSTMENT:
      return quantity - currentBalance;
  }
}

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListStockMovementsQueryDto) {
    const where: Prisma.StockMovementWhereInput = {
      productId: query.productId,
      type: query.type,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.stockMovement.findMany({
        where,
        include: withProduct,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: query.skip,
        take: query.pageSize,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return paginate(data, total, query);
  }

  /**
   * Registra uma movimentação e atualiza o saldo do produto atomicamente.
   *
   * Concorrência: duas saídas simultâneas poderiam ler o mesmo saldo e as duas
   * passarem na validação. Para evitar isso usamos *optimistic locking*: o
   * UPDATE só acontece se o saldo ainda for o que lemos. Se outra requisição
   * mudou antes, nada é atualizado e devolvemos 409 para o cliente tentar de novo.
   */
  async create(dto: CreateStockMovementDto) {
    if (dto.type !== MovementType.ADJUSTMENT && dto.quantity < 1) {
      throw new BadRequestException('Entradas e saídas precisam de quantidade maior que zero');
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: dto.productId } });
      if (!product) throw new NotFoundException(`Produto ${dto.productId} não encontrado`);
      if (!product.active) {
        throw new ConflictException('Produto arquivado não aceita movimentações');
      }

      const delta = computeDelta(dto.type, dto.quantity, product.quantity);
      if (delta === 0) {
        throw new BadRequestException('O saldo contado é igual ao atual, nada a ajustar');
      }

      const balanceAfter = product.quantity + delta;
      if (balanceAfter < 0) {
        throw new UnprocessableEntityException(
          `Saldo insuficiente: disponível ${product.quantity}, solicitado ${-delta}`,
        );
      }

      const { count } = await tx.product.updateMany({
        where: { id: product.id, quantity: product.quantity },
        data: { quantity: balanceAfter },
      });
      if (count === 0) {
        throw new ConflictException('O saldo foi alterado por outra operação. Tente novamente.');
      }

      return tx.stockMovement.create({
        data: {
          productId: product.id,
          type: dto.type,
          delta,
          balanceAfter,
          note: dto.note,
        },
        include: withProduct,
      });
    });
  }
}
