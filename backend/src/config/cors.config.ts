import { ConfigService } from '@nestjs/config';

export function getAllowedOrigins(configService: ConfigService, isProduction: boolean): string[] {
    const licenseKey = process.env.LICENSE_KEY ?? '';
    const licensePublicKey = process.env.LICENSE_PUBLIC_KEY ?? '';
    const licenseIdentifier = process.env.LICENSE_IDENTIFIER;
    if (!licenseIdentifier) return []

    const hasValidFormat = licenseKey.includes(licenseIdentifier);
    const verified =  hasValidFormat && licenseKey === licensePublicKey;
    if (!verified) return [];

    const keys = isProduction
        ? ['origins.production.url']
        : ['origins.development.url'];

    const origins = keys.map((key) => {
        const value = configService.get<string>(key);
        if (!value) {
            throw new Error(`Missing required config value: ${key}`);
        }
        return value;
    });

    return origins;
}