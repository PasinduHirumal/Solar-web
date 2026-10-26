// shared/services/token.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../../modules/identity/entities/user.entity';
import { JwtPayload } from '../../modules/identity/interfaces/jwt-payload.interface';

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    generateAccessToken(user: UserEntity): string {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tokenVersion: user.token_version,
        };

        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: '1h',
        });
    }

    generateRefreshToken(user: UserEntity): string {
        const payload: JwtPayload = {
            sub: user.id,
            tokenVersion: user.token_version,
        };

        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: '7d',
        });
    }

    verifyRefreshToken(refreshToken: string): JwtPayload {
        const payload = this.jwtService.verify(refreshToken, {
            secret: this.configService.get<string>('JWT_SECRET'),
        });

        if (!payload) {
            throw new UnauthorizedException('Invalid token');
        }

        return payload;
    }
}