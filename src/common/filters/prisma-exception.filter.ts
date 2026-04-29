import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/**
 * 🔑 ExceptionFilter — Prisma Error Handling
 *
 * NestJS Exception Filters catch errors thrown during request handling.
 * @Catch(Prisma.PrismaClientKnownRequestError) targets only Prisma errors.
 *
 * Common Prisma error codes:
 *   P2002 → Unique constraint violation  (409 Conflict)
 *   P2025 → Record not found             (404 Not Found)
 *   P2003 → Foreign key constraint fail  (400 Bad Request)
 *   P2000 → Value too long               (400 Bad Request)
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, message } = this.mapError(exception);

    this.logger.error(`Prisma [${exception.code}] → ${exception.message}`);

    response.status(status).json({
      statusCode: status,
      error: message,
      prismaCode: exception.code,
    });
  }

  private mapError(e: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
  } {
    switch (e.code) {
      case 'P2002': {
        const fields = (e.meta?.target as string[])?.join(', ') ?? 'field';
        return {
          status: HttpStatus.CONFLICT,
          message: `Unique constraint failed on: ${fields}`,
        };
      }
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: (e.meta?.cause as string) ?? 'Record not found',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Foreign key constraint failed',
        };
      case 'P2000':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Input value too long',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Database error (${e.code})`,
        };
    }
  }
}
