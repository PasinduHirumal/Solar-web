import { IntersectionType } from "@nestjs/swagger";
import { PaginationQueryDto } from "../pagination-query.dto";
import { SearchQueryDto } from "../search-query.dto";
import { WithSort } from "../mixins/with-sort.dto";
import { IsBoolean, IsOptional } from "class-validator";
import { TransformBoolean } from "../../transformers/boolean.transformer";

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