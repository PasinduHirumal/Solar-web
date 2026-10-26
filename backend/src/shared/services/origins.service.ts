import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../modules/identity/enums/user.enum';
import { isAdminRole } from '../../utils/role.util';

export interface PanelUrls {
    fallbackUrl: string;
}

@Injectable()
export class OriginUrlService {
    constructor(private readonly configService: ConfigService) {}

    getPanelUrls(): PanelUrls {
        const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

        const panelUrl = isProduction
            ? this.configService.get<string>('origins.production.url')
            : this.configService.get<string>('origins.development.url');

        return {
            fallbackUrl: panelUrl!,
        };
    }

    resolveTargetUrl(role: UserRole, urls: PanelUrls): string {
       return isAdminRole(role) ? urls.fallbackUrl : urls.fallbackUrl;
    }
}