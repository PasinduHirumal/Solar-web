import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';
import { UserResponse } from '../types/user-response.types';
import { RequestEmailDto, ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateUserRoleDto } from './dto/user-update.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../entities/user.entity';
import { UserExistsPipe } from './pipes/user-exists.pipe';

@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService,
    ) {}

    @Get('')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getAllUsers(
        @Query() query: FindUsersQueryDto,
    ): Promise<PaginatedResponse<UserResponse>> {
        return await this.userService.findAllUsers(query);
    }

    @Post('reset-password-link')
    @HttpCode(HttpStatus.OK)
    async sendResetLink(
        @Body() dto: RequestEmailDto,
    ): Promise<any> {
        await this.userService.sendResetPasswordLink(dto);
        return {
            message: "If an account exists with that email, a reset link has been sent to your email"
        };
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(
        @Body() dto: ResetPasswordDto,
    ): Promise<any> {
        await this.userService.resetPassword(dto);
        return {
            message: "Password has been reset successfully"
        };
    }

    @Put(':user_id/change-role')
    @Roles(UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateUserRole(
        @Param('user_id', new ParseUUIDPipe({ version: '4' }), UserExistsPipe) user: UserEntity,
        @CurrentUser() auth_user: UserEntity,
        @Body() dto: UpdateUserRoleDto,
    ): Promise<UserResponse> {
        return await this.userService.updateUserRole(user, auth_user, dto);
    }

    @Put(':user_id/toggle-status')
    @Roles(UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async toggleUserStatus(
        @Param('user_id', new ParseUUIDPipe({ version: '4' }), UserExistsPipe) user: UserEntity,
        @CurrentUser() auth_user: UserEntity,
    ): Promise<UserResponse> {
        return await this.userService.toggleUserStatus(user, auth_user);
    }

    @Get(':user_id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getUserById(
        @Param('user_id', new ParseUUIDPipe({ version: '4' })) user_id: string,
    ): Promise<UserResponse> {
        return await this.userService.findUserById(user_id);
    }

    @Delete(':user_id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async deleteUser(
        @Param('user_id', new ParseUUIDPipe({ version: '4' }), UserExistsPipe) user: UserEntity,
        @CurrentUser() auth_user: UserEntity,
    ): Promise<void> {
        await this.userService.deleteUser(user, auth_user);
    }
}
