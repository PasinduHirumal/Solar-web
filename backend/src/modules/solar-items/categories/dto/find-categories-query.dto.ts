import { IntersectionType } from "@nestjs/swagger";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";
import { SearchQueryDto } from "../../../../common/dto/search-query.dto";
import { WithSort } from "../../../../common/dto/mixins/with-sort.dto";
import { IsBoolean, IsOptional } from "class-validator";
import { TransformBoolean } from "../../../../common/transformers/boolean.transformer";

export class FindCategoriesQueryDto extends IntersectionType(
    PaginationQueryDto,
    SearchQueryDto,
    WithSort(['title', 'created_at'] as const, 'created_at'),
) {
    @IsOptional()
    @IsBoolean()
    @TransformBoolean()
    readonly is_active?: boolean;
}