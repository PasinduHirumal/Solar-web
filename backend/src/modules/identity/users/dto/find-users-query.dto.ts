import { IntersectionType } from "@nestjs/swagger";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";
import { SearchQueryDto } from "../../../../common/dto/search-query.dto";
import { WithSort } from "../../../../common/dto/mixins/with-sort.dto";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { UserRole } from "../../enums/user.enum";
import { TransformBoolean } from "../../../../common/transformers/boolean.transformer";

export class FindUsersQueryDto extends IntersectionType(
    PaginationQueryDto,
    SearchQueryDto,
    WithSort(['role', 'name', 'created_at'] as const, 'created_at')
) {
    @IsOptional()
    @IsEnum(UserRole)
    readonly role?: UserRole;

    @IsOptional()
    @IsBoolean()
    @TransformBoolean()
    readonly is_anonymous?: boolean;

    @IsOptional()
    @IsBoolean()
    @TransformBoolean()
    readonly is_active?: boolean; 
}