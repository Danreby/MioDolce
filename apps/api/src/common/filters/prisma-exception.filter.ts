import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

/**
 * Traduz erros conhecidos do Prisma para respostas HTTP. Sem isso, violar um
 * índice único viraria um 500 genérico em vez de um 409 útil para o cliente.
 * Códigos: https://www.prisma.io/docs/orm/reference/error-reference
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const [status, message] = this.map(exception);

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({ statusCode: status, message, error: exception.code });
  }

  private map(e: Prisma.PrismaClientKnownRequestError): [HttpStatus, string] {
    switch (e.code) {
      case 'P2002':
        return [HttpStatus.CONFLICT, `Já existe um registro com este valor em: ${uniqueField(e)}`];
      case 'P2003':
        return [HttpStatus.CONFLICT, 'Registro referenciado por outros dados, operação não permitida'];
      case 'P2025':
        return [HttpStatus.NOT_FOUND, 'Registro não encontrado'];
      default:
        return [HttpStatus.INTERNAL_SERVER_ERROR, 'Erro inesperado no banco de dados'];
    }
  }
}

interface UniqueViolationMeta {
  target?: string | string[];
  // Formato usado quando o Prisma roda com driver adapter (nosso caso).
  driverAdapterError?: { cause?: { table?: string; constraint?: { index?: string; fields?: string[] } } };
}

/** Descobre qual campo violou o índice único, ex.: "products_sku_key" -> "sku". */
function uniqueField(e: Prisma.PrismaClientKnownRequestError): string {
  const meta = (e.meta ?? {}) as UniqueViolationMeta;
  if (meta.target) return String(meta.target);

  const cause = meta.driverAdapterError?.cause;
  if (cause?.constraint?.fields?.length) return cause.constraint.fields.join(', ');
  const index = cause?.constraint?.index;
  if (index) return index.replace(`${cause.table}_`, '').replace(/_key$/, '');
  return 'campo único';
}
