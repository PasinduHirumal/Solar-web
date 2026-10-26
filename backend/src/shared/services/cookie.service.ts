import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';
import { OriginUrlService } from './origins.service';

@Injectable()
export class CookieService {
    private readonly logger = new Logger(CookieService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly originUrlService: OriginUrlService,
    ) {}

    getRefreshTokenCookieOptions(remember_me: boolean = false): CookieOptions {
        const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
        
        let domain: string | undefined;

        if (isProduction) {
            const { fallbackUrl } = this.originUrlService.getPanelUrls();

            if (fallbackUrl) {
                try {
                    domain = new URL(fallbackUrl).hostname;
                } catch (error) {
                    this.logger.warn('Failed to parse domain for cookies', error);
                }
            }
        }

        return {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            path: '/',
            domain,
            ...(remember_me ? { maxAge: 7 * 24 * 60 * 60 * 1000 } : {}),
        };
    }
}