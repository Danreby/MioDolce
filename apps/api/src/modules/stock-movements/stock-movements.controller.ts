import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto.js';
import { ListStockMovementsQueryDto } from './dto/list-stock-movements-query.dto.js';
import { StockMovementsService } from './stock-movements.service.js';

// Sem PATCH/DELETE de propósito: o histórico é imutável. Erros se corrigem
// com uma nova movimentação (estorno ou ajuste), como num extrato bancário.
@ApiTags('stock-movements')
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly movements: StockMovementsService) {}

  @Get()
  findAll(@Query() query: ListStockMovementsQueryDto) {
    return this.movements.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateStockMovementDto) {
    return this.movements.create(dto);
  }
}
