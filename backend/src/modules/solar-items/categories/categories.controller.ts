import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { FindCategoriesQueryDto } from './dto/find-categories-query.dto';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';
import { ItemCategoryEntity } from './entities/item-category.entity';
import { Roles } from '../../identity/auth/decorators/roles.decorator';
import { UserRole } from '../../identity/enums/user.enum';
import { JwtAuthGuard } from '../../identity/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../identity/auth/guards/roles.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ItemCategoryExistsPipe } from './pipes/category-exists.pipe';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
    constructor(
        private readonly categoryService: CategoriesService,
    ) {}

    @Get()
    async getAllCategories(
        @Query() query: FindCategoriesQueryDto,
    ): Promise<PaginatedResponse<ItemCategoryEntity>> {
        return this.categoryService.findAll(query);
    }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async createCategory(
        @Body() dto: CreateCategoryDto,
    ): Promise<ItemCategoryEntity> {
        return this.categoryService.create(dto);
    }

    @Put(':category_id/toggle/status')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async toggleCategoryStatus(
        @Param('category_id', new ParseUUIDPipe({ version: '4' }), ItemCategoryExistsPipe) category: ItemCategoryEntity,
    ): Promise<ItemCategoryEntity> {
        return await this.categoryService.toggleStatus(category);
    }

    @Put(':category_id/update/data')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateCategoryData(
        @Param('category_id', new ParseUUIDPipe({ version: '4' }), ItemCategoryExistsPipe) category: ItemCategoryEntity,
        @Body() dto: UpdateCategoryDto,
    ): Promise<ItemCategoryEntity> {
        return await this.categoryService.updateData(category, dto);
    }

    @Get(':category_id')
    async getCategoryById(
        @Param('category_id', new ParseUUIDPipe({ version: '4' })) category_id: string,
    ): Promise<ItemCategoryEntity> {
        return this.categoryService.findById(category_id);
    }

    @Delete(':category_id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Roles(UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async deleteCategory(
        @Param('category_id', new ParseUUIDPipe({ version: '4' }), ItemCategoryExistsPipe) category: ItemCategoryEntity,
    ): Promise<void> {
        await this.categoryService.remove(category);
    }
}
