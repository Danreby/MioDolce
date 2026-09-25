import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';
import type { Env } from '../config/env.schema.js';

/**
 * O PrismaClient vira um provider do Nest. Assim qualquer service recebe o
 * banco por injeção de dependência e, nos testes, dá para trocar por um fake.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService<Env, true>) {
    const url = new URL(config.get('DATABASE_URL', { infer: true }));

    // Prisma 7 conversa com o banco por um "driver adapter". Para MySQL o
    // adapter oficial usa o driver `mariadb`, que é compatível com MySQL.
    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      connectionLimit: 10,
      // Necessário para autenticar no MySQL 8 sem TLS (ambiente local).
      allowPublicKeyRetrieval: true,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
