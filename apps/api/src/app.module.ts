import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.schema.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { StockMovementsModule } from './modules/stock-movements/stock-movements.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

/**
 * Módulo raiz. Cada funcionalidade vive no seu próprio módulo em src/modules,
 * com controller (HTTP), service (regras) e dto (formato de entrada).
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    PrismaModule,
    CategoriesModule,
    ProductsModule,
    StockMovementsModule,
    DashboardModule,
  ],
})
export class AppModule {}
