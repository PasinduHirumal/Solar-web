import { ConflictException, HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../../entities/user.entity";
import { QueryFailedError, Repository } from "typeorm";
import { PasswordService } from "../../../../shared/services/password.service";
import { TokenService } from "../../../../shared/services/token.service";
import { RegisterUserAnonymous, RegisterUserDto } from "../dto/user-register.dto";
import { UserRole } from "../../enums/user.enum";
import { AuthResponse } from "../../interfaces/auth-response.interface";
import { CreateUserOptions } from "../../interfaces/create-user-options.interface";
import { UserResponse } from "../../types/user-response.types";

@Injectable()
export class AuthHelperService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly authRepo: Repository<UserEntity>,

        private readonly passwordService: PasswordService,
        private readonly tokenService: TokenService,
    ) {}
    
    async findEntityById(user_id: string): Promise<UserEntity | null> {
        return await this.authRepo.findOne({
            where: { id: user_id }
        });
    }

    async findEntityByEmail(email: string): Promise<UserEntity | null> {
        return await this.authRepo.findOne({
            where: { email: email }
        });;
    }

    async createUserBySystem(dto: RegisterUserDto | RegisterUserAnonymous, options: CreateUserOptions): Promise<UserEntity> {
        const exists = await this.authRepo.existsBy({ email: dto.email });
        if (exists) {
            throw new ConflictException(
                `Email already in use, if you forgot your password or don't know, click 'Forgot password' and reset your password`
            );
        }

        const password = 'password' in dto ? dto.password : this.passwordService.generateRandom();
        const hashedPassword = await this.passwordService.hash(password);

        const role = 'role' in dto ? dto.role : UserRole.USER;

        try {
            return await this.authRepo.manager.transaction(async (manager) => {
                const newUser = manager.create( UserEntity, {
                    email: dto.email,
                    name: dto.name,
                    password: hashedPassword,
                    role: role ?? UserRole.USER,
                    google_id: options?.googleId ?? null,
                    is_anonymous: options.isAnonymous,
                    must_change_password: options.mustChangePassword,
                });

                return await manager.save(newUser);
            });
        } catch (error) {
            if (error instanceof QueryFailedError && (error as any).code === 'ER_DUP_ENTRY') {
                throw new ConflictException('Email already in use');
            }
            
            if (error instanceof HttpException) throw error;
                        
            throw error;
        }
    }

    async issueAuthTokens(user: UserEntity): Promise<AuthResponse> {
        await this.authRepo.increment({ id: user.id }, 'token_version', 1);

        const updatedUser = await this.authRepo.findOne({ where: { id: user.id } });
        if (!updatedUser) throw new UnauthorizedException('Invalid Credentials');

        return {
            user: new UserResponse(updatedUser),
            accessToken: this.tokenService.generateAccessToken(updatedUser),
            refreshToken: this.tokenService.generateRefreshToken(updatedUser),
        };
    }

    async findEntityWithPassword(email: string): Promise<UserEntity | null> {
        return await this.authRepo
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email: email })
            .getOne();
    }

    async findEntityWithTokenVersion(user_id: string): Promise<UserEntity | null> {
        return await this.authRepo
            .createQueryBuilder('user')
            .addSelect('user.token_version')
            .where('user.id = :id', { id: user_id })
            .getOne();
    }

    validateLogin(user: UserEntity): void {
        if (!user.is_active) {
            throw new UnauthorizedException('Your account is inactivated');
        }

        if (user.must_change_password) {
            throw new UnauthorizedException(`You need to reset your password. Go to "Forgot password ?" and reset your password`);
        }
    }
}