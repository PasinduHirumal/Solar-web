import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { isAdminRole } from '../../../utils/role.util';
import { UserRole } from '../enums/user.enum';
import { Repository } from 'typeorm';
import { PasswordService } from '../../../shared/services/password.service';
import { TokenService } from '../../../shared/services/token.service';
import { ConfigService } from '@nestjs/config';
import { UserEventsService } from '../../../events/services/user-events.service';
import { AuthenticationService } from '../../../integrations/authentication/authentication.service';
import { LoginAttemptService } from '../../../shared/services/login-attempt.service';
import { RegisterUserDto } from './dto/user-register.dto';
import { UserResponse } from '../types/user-response.types';
import { LoginUserDto } from './dto/user-login.dto';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthHelperService } from './helpers/auth-helper.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(UserEntity)
        private readonly authRepo: Repository<UserEntity>,

        private readonly passwordService: PasswordService,
        private readonly tokenService: TokenService,
        private readonly configService: ConfigService,
        private readonly userEventService: UserEventsService,
        private readonly authenticationService: AuthenticationService,
        private readonly loginAttemptService: LoginAttemptService,

        private readonly authHelperService: AuthHelperService,
    ) {}

    async onModuleInit() {
        await this.ensureDefaultAdmin();
    }


    // methods
    async register(dto: RegisterUserDto): Promise<UserResponse> {
        const newUser = await this.authHelperService.createUserBySystem(dto, {
            googleId: null,
            isAnonymous: false,
            mustChangePassword: isAdminRole(dto.role ?? UserRole.USER),
        });

        this.userEventService.emitUserRegistered(newUser);

        return newUser;
    }

    async login(dto: LoginUserDto): Promise<AuthResponse> {
        const user = await this.authHelperService.findEntityWithPassword(dto.email)

        if (!user) {
            this.loginAttemptService.recordFailedAttempt(dto.email);
            throw new UnauthorizedException('Invalid Email');
        }

        const isValid = await this.passwordService.verify(dto.password, user.password);
        if (!isValid) {
            const result = this.loginAttemptService.recordFailedAttempt(dto.email);
            
            if (result.blocked) {
                throw new HttpException(
                    { message: result.message, retryAfter: result.retryAfter },
                    HttpStatus.TOO_MANY_REQUESTS,
                );
            }
            
            throw new UnauthorizedException('Invalid Password');
        } 

        this.authHelperService.validateLogin(user);

        // Successful login — clear attempt history
        this.loginAttemptService.clearRecord(dto.email);

        if (user.is_anonymous) {
            await this.authRepo.update(user.id, { is_anonymous: false });
        }

        await this.authRepo.update(user.id, { remember_me: !!dto.remember_me });
        await this.authRepo.increment({ id: user.id }, 'token_version', 1);

        const updatedUser = await this.authHelperService.findEntityWithTokenVersion(user.id);
        if (!updatedUser) throw new UnauthorizedException('Invalid Credentials');

        return {
            user: new UserResponse(updatedUser),
            accessToken: this.tokenService.generateAccessToken(updatedUser),
            refreshToken: this.tokenService.generateRefreshToken(updatedUser),
        };
    }

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const payload = this.tokenService.verifyRefreshToken(refreshToken);

        const user = await this.authHelperService.findEntityWithTokenVersion(payload.sub);
        if (!user) throw new UnauthorizedException('User not found');

        if (user.token_version !== payload.tokenVersion) {
            throw new UnauthorizedException('Token has been revoked');
        }

        if (user.is_anonymous) {
            throw new UnauthorizedException('Unauthorized for anonymous users. Please login or change password to continue');
        }

        await this.authRepo.increment({ id: user.id }, 'token_version', 1);

        const updatedUser = await this.authHelperService.findEntityWithTokenVersion(user.id);
        if (!updatedUser) throw new UnauthorizedException('User not found');

        return {
            user: new UserResponse(updatedUser),
            accessToken: this.tokenService.generateAccessToken(updatedUser),
            refreshToken: this.tokenService.generateRefreshToken(updatedUser),
        };
    }

    async checkAuth(user: UserEntity): Promise<UserResponse> {
        if (user.role === UserRole.USER && user.is_anonymous) {
            throw new UnauthorizedException('Unauthorized for anonymous users. Please login or change password to see continue');
        }

        return new UserResponse(user);
    }


    // googleOAuth
    async googleOAuthStart(state?: string): Promise<string> {
        return await this.authenticationService.initiateGoogleOAuthStart(state);
    }

    async googleAuthCallback(code: string, rememberMe: boolean = false): Promise<AuthResponse> {
        const payload = await this.authenticationService.verifyGoogleAuthPayload(code);

        let user = await this.authHelperService.findEntityByEmail(payload.email);

        if (!user) {
            user = await this.authHelperService.createUserBySystem(
                {
                    email: payload.email,
                    name: payload.username ?? payload.email.split('@')[0],
                },
                {
                    googleId: payload.googleId,
                    isAnonymous: false,
                    mustChangePassword: false,
                }
            );

            this.userEventService.emitUserRegistered(user);
        }

        try {
            this.authHelperService.validateLogin(user);
        } catch (error) {
            if (error instanceof HttpException) {
                (error as any).userRole = user.role;
            }
            throw error;
        }

        // Link google_id if not already linked
        if (!user.google_id && payload.googleId) {
            await this.authRepo.update(user.id, { google_id: payload.googleId });
        }

        if (user.is_anonymous) {
            await this.authRepo.update(user.id, { is_anonymous: false });
        }

        await this.authRepo.manager.update(UserEntity, user.id, { remember_me: !!rememberMe });
        await this.authRepo.increment({ id: user.id }, 'token_version', 1);

        const updatedUser = await this.authHelperService.findEntityWithTokenVersion(user.id);
        if (!updatedUser) throw new UnauthorizedException('User not found');
        
        return {
            user: new UserResponse(updatedUser),
            accessToken: this.tokenService.generateAccessToken(updatedUser),
            refreshToken: this.tokenService.generateRefreshToken(updatedUser),
        };
    }


    // ensure defaults
    private async ensureDefaultAdmin(): Promise<void> {
        const name = this.configService.get<string>('admin.name') ?? 'Super Admin';
        const email = this.configService.get<string>('admin.email') ?? 'admin@example.com';
        const rawPassword = this.configService.get<string>('admin.password');
        const password = rawPassword ?? this.passwordService.generateRandom();
        
        const dto = plainToInstance(RegisterUserDto, { email, name, password, role: UserRole.SUPER_ADMIN});

        const exists = await this.authRepo.existsBy({ email: dto.email });
        if (exists) return;

        const errors = await validate(dto);
        if (errors.length > 0) {
            const messages = errors.flatMap(err => Object.values(err.constraints ?? {}));
            throw new Error(`Invalid default admin configuration: ${messages.join(', ')}`);
        }

        const admin = await this.authHelperService.createUserBySystem(dto, {
            googleId: null,
            isAnonymous: false,
            mustChangePassword: !rawPassword,
        });

        this.logger.log(`Admin account seeded with Email: ${admin.email}`);
    }
}
