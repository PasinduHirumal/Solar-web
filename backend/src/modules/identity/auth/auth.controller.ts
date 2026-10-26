import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { CookieService } from '../../../shared/services/cookie.service';
import { OriginUrlService } from '../../../shared/services/origins.service';
import { RegisterUserDto } from './dto/user-register.dto';
import { LoginThrottlerGuard } from './guards/login-throttler.guard';
import { LoginUserDto } from './dto/user-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserEntity } from '../entities/user.entity';
import type { Request, Response } from 'express';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../enums/user.enum';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly cookieService: CookieService,
        private readonly originUrlService: OriginUrlService,
    ) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @Roles(UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async register(
        @Body() dto: RegisterUserDto,
    ): Promise<any> {
        const result = await this.authService.register(dto);
        return { 
            message: 'User registration successful', 
            result
        };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(LoginThrottlerGuard)
    async login(
        @Body() dto: LoginUserDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<any> {
        const result = await this.authService.login(dto);
        res.cookie('refreshToken', result.refreshToken, this.cookieService.getRefreshTokenCookieOptions(result.user.remember_me));

        return {
            message: "Login successful",
            accessToken: result.accessToken,
            user: result.user
        };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<any> {
        const refreshToken = req.cookies['refreshToken'];
        const result = await this.authService.refreshToken(refreshToken);
        res.cookie('refreshToken', result.refreshToken, this.cookieService.getRefreshTokenCookieOptions(result.user.remember_me));

        return { 
            message: "Token refreshed successfully",
            accessToken: result.accessToken,
            user: result.user
        };
    }

    @Get('check-auth')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async checkAuth(
        @CurrentUser() user: UserEntity,
    ): Promise<any> {
        const authUser = await this.authService.checkAuth(user);
        return {
            message: 'CheckAuth successful',
            user: authUser
        };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Res({ passthrough: true }) res: Response
    ): Promise<any> {
        res.clearCookie('refreshToken', this.cookieService.getRefreshTokenCookieOptions());
        return { 
            message: "Logged out successfully",
            user: null
        };
    }


    //-----------Google OAuth routes-----------------------------------
    @Get('google')
    @HttpCode(HttpStatus.OK)
    async googleOAuth(
        @Query('remember_me') remember_me: string | undefined,
        @Res() res: Response,
    ): Promise<any> {
        const state = remember_me === 'true' ? 'remember_me=true' : 'remember_me=false';
        const url = await this.authService.googleOAuthStart(state);
        return res.redirect(url);
    }

    @Get('google/callback')
    @HttpCode(HttpStatus.OK)
    async googleAuthCallback(
        @Query('code') code: string,
        @Query('state') state: string | undefined,
        @Res() res: Response,
    ): Promise<any> {
        const urls = this.originUrlService.getPanelUrls();

        const rememberMe = state === 'remember_me=true';
        const loginPath = this.configService.get<string>('LOGIN_PATH');

        if (!code) {
            return res.redirect(`${urls.fallbackUrl}/${loginPath}?google_auth=error&message=No authorization code provided`);
        }

        try {
            const result = await this.authService.googleAuthCallback(code, rememberMe);
            const targetUrl = this.originUrlService.resolveTargetUrl(result.user.role, urls);

            res.cookie('refreshToken', result.refreshToken, this.cookieService.getRefreshTokenCookieOptions(result.user.remember_me));

            return res.redirect(`${targetUrl}${loginPath}?google_auth=success`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
            const encodedMessage = encodeURIComponent(errorMessage);

            const userRole = (error as any)?.userRole;
            const errorRedirectUrl = userRole
                ? this.originUrlService.resolveTargetUrl(userRole, urls)
                : urls.fallbackUrl;

            return res.redirect(`${errorRedirectUrl}${loginPath}?google_auth=error&message=${encodedMessage}`);
        }
    }
}
