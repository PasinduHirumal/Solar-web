import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard, ThrottlerLimitDetail, ThrottlerRequest } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    private readonly customLogger = new Logger(CustomThrottlerGuard.name);

    protected async getTracker(req: Record<string, any>): Promise<string> {
        return req.ips?.length ? req.ips[0] : req.ip;
    }

    protected async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
        const request = requestProps.context.switchToHttp().getRequest();
        request.__throttlerName = requestProps.throttler.name;
        return super.handleRequest(requestProps);
    }

    protected async throwThrottlingException(
        context: ExecutionContext,
        throttlerLimitDetail: ThrottlerLimitDetail,
    ): Promise<void> {
        const request = context.switchToHttp().getRequest();

        this.customLogger.warn(
            `[${request.__throttlerName ?? 'unknown'}] Rate limit exceeded ` +
            `(${throttlerLimitDetail.limit} req/${throttlerLimitDetail.ttl / 1000}s) ` +
            `tracker=${throttlerLimitDetail.tracker}`,
        );

        throw new ThrottlerException(
            'Too many requests, please slow down and try again shortly.',
        );
    }
}