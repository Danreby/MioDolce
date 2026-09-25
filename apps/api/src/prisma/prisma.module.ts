import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

// @Global: registrado uma vez no AppModule e disponível em todos os módulos,
// sem precisar importar PrismaModule em cada um.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
