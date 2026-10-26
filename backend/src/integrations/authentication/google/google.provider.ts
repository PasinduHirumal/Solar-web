import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";

export const GoogleOAuthProvider = {
    provide: 'GOOGLE_OAUTH',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        const clientId = configService.get<string>('google.client_id');
        const clientSecret = configService.get<string>('google.client_secret');
        const redirectUri = configService.get<string>('google.client_redirect_url');

        return new OAuth2Client(clientId, clientSecret, redirectUri);
    }
}