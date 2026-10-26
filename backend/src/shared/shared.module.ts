import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CookieService } from './services/cookie.service';
import { OriginUrlService } from './services/origins.service';
import { LoginAttemptService } from './services/login-attempt.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
            }),
        }),
    ],
    providers: [
        CookieService,
        OriginUrlService,
        LoginAttemptService,
        PasswordService,
        TokenService,
    ],
    exports: [
        CookieService,
        OriginUrlService,
        LoginAttemptService,
        PasswordService,
        TokenService,
    ]
})
export class SharedModule {}
