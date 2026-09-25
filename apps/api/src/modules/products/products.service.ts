import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { MovementType } from '../../generated/prisma/enums.js';
import { paginate } from '../../common/dto/pagination-query.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListProductsQueryDto, StockStatus } from './dto/list-products-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

// Reaproveitado em todas as queries para devolver sempre o mesmo formato.
const withCategory = { category: { select: { id: true, name: true } } } as const;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListProductsQueryDto) {
    const where: Prisma.ProductWhereInput = {
      active: !query.archived,
      categoryId: query.categoryId,
      ...(query.search && {
        OR: [{ name: { contains: query.search } }, { sku: { contains: query.search } }],
      }),
      ...this.statusFilter(query.status),
    };

    // Página + total na mesma ida ao banco.
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: withCategory,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(data, total, query);
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id }, include: withCategory });
    if (!product) throw new NotFoundException(`Produto ${id} não encontrado`);
    return product;
  }

  async create({ initialQuantity = 0, ...data }: CreateProductDto) {
    await this.ensureCategoryExists(data.categoryId);

    // Produto + movimentação de saldo inicial: ou grava os dois, ou nenhum.
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: { ...data, quantity: initialQuantity },
        include: withCategory,
      });

      if (initialQuantity > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: MovementType.IN,
            delta: initialQuantity,
            balanceAfter: initialQuantity,
            note: 'Saldo inicial',
          },
        });
      }
      return product;
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    if (dto.categoryId) await this.ensureCategoryExists(dto.categoryId);

    return this.prisma.product.update({ where: { id }, data: dto, include: withCategory });
  }

  async remove(id: number) {
    await this.findOne(id);
    const movements = await this.prisma.stockMovement.count({ where: { productId: id } });
    if (movements > 0) {
      throw new ConflictException(
        'Produto possui histórico de movimentações. Arquive em vez de excluir.',
      );
    }
    await this.prisma.product.delete({ where: { id } });
  }

  /**
   * Comparar duas colunas (quantity <= min_quantity) usa "field references"
   * do Prisma: `this.prisma.product.fields.minQuantity`.
   */
  private statusFilter(status?: StockStatus): Prisma.ProductWhereInput {
    const min = this.prisma.product.fields.minQuantity;
    switch (status) {
      case 'out':
        return { quantity: { lte: 0 } };
      case 'low':
        return { AND: [{ quantity: { gt: 0 } }, { quantity: { lte: min } }] };
      case 'ok':
        return { quantity: { gt: min } };
      default:
        return {};
    }
  }

  private async ensureCategoryExists(categoryId: number) {
    const exists = await this.prisma.category.count({ where: { id: categoryId } });
    if (!exists) throw new NotFoundException(`Categoria ${categoryId} não encontrada`);
  }
}
