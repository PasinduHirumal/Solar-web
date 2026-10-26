import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { QueryFailedError } from "typeorm";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly configService: ConfigService) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        if (request.url === '/favicon.ico') {
            return response.status(HttpStatus.NO_CONTENT).send();
        }

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: any = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object') {
                message =
                    (exceptionResponse as any).message ||
                    (exceptionResponse as any).error ||
                    exception.message;
                errors = (exceptionResponse as any).message;
            } else {
                message = exceptionResponse as string;
            }
        } else if (exception instanceof QueryFailedError) {
            const dbError = exception as QueryFailedError & { code?: string };

            switch (dbError.code) {
                case 'ER_DUP_ENTRY':
                    status = HttpStatus.CONFLICT;
                    message = 'A record with these values already exists';
                    break;
                case 'ER_NO_REFERENCED_ROW_2':
                case 'ER_ROW_IS_REFERENCED_2':
                    status = HttpStatus.CONFLICT;
                    message = 'This operation violates a data relationship constraint';
                    break;
                case 'ER_BAD_NULL_ERROR':
                    status = HttpStatus.BAD_REQUEST;
                    message = 'A required field is missing';
                    break;
                default:
                    status = HttpStatus.INTERNAL_SERVER_ERROR;
                    message = 'Database error occurred';
            }
        } else if (exception instanceof Error && this.configService.get<string>('NODE_ENV') === 'development') {
            message = exception.message;
        }

        // Log the error
        this.logger.error(
            `${request.method} ${request.url} - Status: ${status} - Message: ${
                Array.isArray(errors) ? errors.join(', ') : message
            }`,
            exception instanceof Error ? exception.stack : String(exception),
        );

        response.status(status).json({
            success: false,
            statusCode: status,
            message: Array.isArray(errors) ? errors.join(', ') : message,
            error: Array.isArray(errors) ? errors : undefined,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}