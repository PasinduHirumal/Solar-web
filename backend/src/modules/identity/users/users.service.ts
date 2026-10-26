import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserRole } from '../enums/user.enum';
import { EntityManager, Repository } from 'typeorm';
import { AuthHelperService } from '../auth/helpers/auth-helper.service';
import { PasswordService } from '../../../shared/services/password.service';
import { CommunicationService } from '../../../integrations/communication/communication.service';
import { UserResponse } from '../types/user-response.types';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';
import { UpdateUserRoleDto } from './dto/user-update.dto';
import { RequestEmailDto, ResetPasswordDto } from './dto/reset-password.dto';
import * as crypto from 'crypto';

const USER_ALIAS = 'user';

const EXACT_FILTER_MAP: Partial<Record<keyof FindUsersQueryDto, string>> = {
    is_active:          `${USER_ALIAS}.is_active`,
    is_anonymous:       `${USER_ALIAS}.is_anonymous`,
    role:               `${USER_ALIAS}.role`,
};

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,

        private readonly authHelperService: AuthHelperService,
        
        private readonly passwordService: PasswordService,
        private readonly mailService: CommunicationService,
    ) {}
    
    async findUserById(user_id: string): Promise<UserResponse> {
        const user = await this.authHelperService.findEntityById(user_id);

        if (!user) throw new NotFoundException('User not found');

        return new UserResponse(user);
    }

    async findAllUsers(query: FindUsersQueryDto): Promise<PaginatedResponse<UserResponse>> {
        const { page = 1, limit = 10, search_term, sort_by = 'created_at', sort_order = 'DESC' } = query;
        const skip = (page - 1) * limit;

        const queryBuilder = this.userRepo
            .createQueryBuilder(USER_ALIAS);

        if (search_term) {
            queryBuilder.andWhere(
                `(
                    ${USER_ALIAS}.name   LIKE :search OR 
                    ${USER_ALIAS}.email  LIKE :search
                )`,
                { search: `%${search_term}%` }
            );
        }

        for (const [key, column] of Object.entries(EXACT_FILTER_MAP)) {
            const value = query[key as keyof FindUsersQueryDto];
            if (value != null) {
                queryBuilder.andWhere(`${column} = :${key}`, { [key]: value });
            }
        }

        if (sort_by === 'role') {
            queryBuilder
                .addOrderBy(
                    `CASE 
                        WHEN ${USER_ALIAS}.role = '${UserRole.SUPER_ADMIN}' THEN 1
                        WHEN ${USER_ALIAS}.role = '${UserRole.ADMIN}' THEN 2
                        WHEN ${USER_ALIAS}.role = '${UserRole.USER}' THEN 3
                        ELSE 4
                    END`,
                    'ASC'
                )
                .addOrderBy(`${USER_ALIAS}.id`, 'ASC');
        }

        if (sort_by === 'name') {
            queryBuilder
                .addOrderBy(`${USER_ALIAS}.name`, sort_order)
                .addOrderBy(`${USER_ALIAS}.id`, 'ASC');
        }

        if (sort_by === 'created_at') {
            queryBuilder
                .addOrderBy(`${USER_ALIAS}.created_at`, sort_order)
        }

        queryBuilder
            .skip(skip)
            .take(limit);

        const [items, totalItems] = await queryBuilder.getManyAndCount();
        const totalPages = Math.ceil(totalItems / limit);

        return {
            items: items.map(user => new UserResponse(user)),
            meta: {
                currentPage: page,
                itemsPerPage: limit,
                totalItems,
                totalPages,
                hasPreviousPage: page > 1,
                hasNextPage: page < totalPages
            }
        };
    }

    async updateUserRole(user: UserEntity, auth_user: UserEntity, dto: UpdateUserRoleDto): Promise<UserResponse> {
        if (user.id === auth_user.id) {
            throw new BadRequestException('You cannot change your own account role');
        }

        if (user.role === UserRole.USER) {
            throw new BadRequestException(`Cannot change role:${user.role} to another role`);
        }

        await this.userRepo.manager.transaction(async (manager: EntityManager) => {
            await manager.increment(UserEntity, { id: user.id }, 'token_version', 1);

            await manager.update(UserEntity, user.id, {
                role: dto.role,
                must_change_password: true,
            });
        });

        return new UserResponse({ ...user, role: dto.role, must_change_password: true });
    }

    async toggleUserStatus(user: UserEntity, auth_user: UserEntity): Promise<UserResponse> {
        if (user.id === auth_user.id) {
            throw new BadRequestException('You cannot change your own account status');
        }

        await this.userRepo.manager.transaction(async (manager: EntityManager) => {
            await manager.increment(UserEntity, { id: user.id }, 'token_version', 1);

            await manager
                .createQueryBuilder()
                .update(UserEntity)
                .set({ is_active: () => 'NOT is_active' })
                .where('id = :id', { id: user.id })
                .execute();
        });

        return new UserResponse({ ...user, is_active: !user.is_active });
    }

    async deleteUser(user: UserEntity, auth_user: UserEntity): Promise<void> {
        if (user.id === auth_user.id) {
            throw new BadRequestException('You cannot delete your own account');
        }

        try {
            await this.userRepo
                .createQueryBuilder()
                .delete()
                .from(UserEntity)
                .where('id = :id', { id: user.id })
                .execute();
        } catch (error) {
            throw new BadRequestException(`Cannot delete user "${user.name}" — it is still assigned to one or more records`);
        }
    }


    // reset password methods
    async sendResetPasswordLink(dto: RequestEmailDto): Promise<void> {
        const user = await this.authHelperService.findEntityByEmail(dto.email);

        if (!user) {
            this.logger.warn(`Password reset requested for non-existent email: ${dto.email}`);
            
            await new Promise(resolve => setTimeout(resolve, 100));
            return;
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        await this.userRepo.manager.update(UserEntity, user.id, {
            temp_token: tokenHash,
            temp_token_expires: new Date(Date.now() + 15 * 60 * 1000),
        });

        try {
            await this.mailService.sendResetPasswordToken(user.email, user.role, rawToken);
        } catch (error) {
            this.logger.error(`Failed to send reset email to: ${user.email}`, error);
            
            // clear the token if email fails
            await this.userRepo.update(
                { id: user.id, temp_token: tokenHash },
                { temp_token: null, temp_token_expires: null },
            );
        }
    }

    async resetPassword(dto: ResetPasswordDto): Promise<void> {
        const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');
        const hashedPassword = await this.passwordService.hash(dto.new_password);

        await this.userRepo.manager.transaction(async (manager: EntityManager) => {
            const user = await manager.findOne(UserEntity, {
                where: { temp_token: tokenHash },
                lock: { mode: 'pessimistic_write' },
            });

            if (!user) {
                throw new ForbiddenException('Invalid or expired token');
            }

            if (!user.temp_token_expires || user.temp_token_expires < new Date()) {
                throw new ForbiddenException('Invalid or expired token');
            }

            await manager.increment(UserEntity, { id: user.id }, 'token_version', 1);

            await manager.update(UserEntity, user.id, {
                password: hashedPassword,
                must_change_password: false,
                temp_token: null,
                temp_token_expires: null,
                is_anonymous: false,
            });
        });
    }
}
