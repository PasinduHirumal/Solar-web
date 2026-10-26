import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GoogleOAuthService } from './google/google.service';
import { GoogleOAuthVerifyResponse } from './google/interfaces/google-auth-response.interface';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly googleOAuthService: GoogleOAuthService,
    ) {}

    async initiateGoogleOAuthStart(state?: string): Promise<string> {
        return await this.googleOAuthService.getAuthUrl(state);
    }

    async verifyGoogleAuthPayload(code: string): Promise<GoogleOAuthVerifyResponse> {
        const payload = await this.googleOAuthService.authenticateUser(code);
        if (!payload) {
            throw new UnauthorizedException('No authorization code provided');
        }

        if (!payload.email) {
            throw new UnauthorizedException('Email not provided by Google');
        }

        return {
            email: payload.email,
            username: payload.username,
            picture: payload.picture,
            googleId: payload.googleId,
        };
    }
}
