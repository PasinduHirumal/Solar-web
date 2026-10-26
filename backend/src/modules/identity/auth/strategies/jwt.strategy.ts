import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthHelperService } from "../helpers/auth-helper.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authHelperService: AuthHelperService,
        private readonly configService: ConfigService
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        
        if (!secret) {
            throw new Error('JWT secret is not configured');
        }

        // Extract the token from Authorization header
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret
        });
    }

    async validate(payload: any) {
        const user = await this.authHelperService.findEntityWithTokenVersion(payload.sub);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        if (user.token_version !== payload.tokenVersion) {
            throw new UnauthorizedException('Token has been revoked');
        }

        return user;
    }
}