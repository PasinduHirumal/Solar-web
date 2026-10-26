import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

export interface Response<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    timestamp: string
};

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        return next.handle().pipe(
            map((data) => {
                // Extract message if it exists
                const message = data?.message || 'Request successful';
                
                // Remove message from data if it exists
                const { message: _, ...dataWithoutMessage } = data || {};
                
                // If data only had a message, use the remaining data, otherwise use original data
                const responseData = data?.message 
                    ? (Object.keys(dataWithoutMessage).length > 0 ? dataWithoutMessage : data)
                    : data;

                return {
                    success: true,
                    statusCode: context.switchToHttp().getResponse().statusCode,
                    message,
                    data: responseData,
                    timestamp: new Date().toISOString(),
                };
            }),
        );
    }
};