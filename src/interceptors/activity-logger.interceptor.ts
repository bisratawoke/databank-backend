import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ActivityLogService } from 'src/modules/auth/services/activity-log.service';

@Injectable()
export class ActivityLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ActivityLoggerInterceptor.name);

  // Define routes that should be excluded from logging
  private readonly excludedRoutes = ['/health', '/metrics', '/favicon.ico'];

  constructor(private readonly activityLogService: ActivityLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();
    const action = `${request.method} ${request.url}`;

    // Skip logging for excluded routes
    if (this.excludedRoutes.some((route) => request.url.includes(route))) {
      return next.handle();
    }

    this.logger.debug(`Starting request processing: ${action}`);

    return next.handle().pipe(
      tap(async (responseBody) => {
        // this.logger.debug("responseBody: ", responseBody)
        try {
          // let userId: string | undefined;
          const duration = Date.now() - startTime;

          // Determine user ID from various possible sources
          const userId = this.getUserId(request, responseBody);

          // this.logger.debug("userId: ", userId)

          // Always log the activity, even for anonymous users
          const sanitizedBody = this.sanitizeRequestBody(request.body);
          const sanitizedHeaders = this.sanitizeHeaders(request.headers);
          const queryParams = request.query;

          await this.activityLogService.create({
            userId: userId || null, // Allow null for anonymous users
            action,
            details: {
              method: request.method,
              url: request.url,
              body: sanitizedBody,
              queryParams,
              headers: sanitizedHeaders,
              statusCode: response.statusCode,
              duration,
              responseStatus: 'success',
              responseSize: this.getResponseSize(responseBody),
              route: request.route?.path,
              timestamp: new Date().toISOString(),
            },
            ipAddress: this.getClientIp(request),
            userAgent: request.headers['user-agent'],
            // sessionId: request.session?.id,
            // referrer: request.headers.referer || request.headers.referrer,
          });

          this.logger.debug(
            `Activity log created - User: ${userId || 'anonymous'}, ` +
              `Duration: ${duration}ms, Status: ${response.statusCode}`,
          );
        } catch (error) {
          this.logger.error('Error creating activity log:', {
            error: error.message,
            stack: error.stack,
            action,
          });
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        // Log error details
        this.activityLogService
          .create({
            userId: this.getUserId(request) || null,
            action,
            details: {
              method: request.method,
              url: request.url,
              statusCode: error.status || 500,
              duration,
              responseStatus: 'error',
              errorMessage: error.message,
              errorName: error.name,
              errorStack: error.stack,
              timestamp: new Date().toISOString(),
            },
            ipAddress: this.getClientIp(request),
            userAgent: request.headers['user-agent'],
          })
          .catch((logError) => {
            this.logger.error('Error logging error activity:', logError);
          });

        throw error;
      }),
    );
  }

  private getUserId(request: any, responseBody?: any): string | undefined {
    // this.logger.debug("request: ", request)
    // Check multiple possible locations for user ID
    return (
      // From response body (e.g., login response)
      responseBody?.user?._id ||
      // From request user object
      request.user?._id ||
      // From session
      // request.session?.userId ||
      // From JWT token if available
      request.token?.userId
    );
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return {};

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'creditCard',
    ];
    const sanitized = { ...body };

    Object.keys(sanitized).forEach((key) => {
      if (
        sensitiveFields.some((field) =>
          key.toLowerCase().includes(field.toLowerCase()),
        )
      ) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = { ...headers };

    Object.keys(sanitized).forEach((key) => {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private getClientIp(request: any): string {
    return (
      request.ip ||
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.connection.remoteAddress ||
      'unknown'
    );
  }

  private getResponseSize(response: any): number {
    try {
      return Buffer.byteLength(JSON.stringify(response), 'utf8');
    } catch {
      return 0;
    }
  }
}
