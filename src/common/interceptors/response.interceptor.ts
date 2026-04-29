import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 🔑 ResponseInterceptor — Global Response Wrapper
 *
 * NestJS Interceptors sit around the route handler (before AND after).
 * The `map` operator transforms the outgoing response value.
 *
 * Result shape:
 *   { statusCode, data, timestamp }
 *
 * Workshop demo: comment out APP_INTERCEPTOR in AppModule to show
 * the difference in response shape.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    const statusCode = context.switchToHttp().getResponse<{ statusCode: number }>().statusCode;

    return next.handle().pipe(
      map((data) => ({
        statusCode,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
