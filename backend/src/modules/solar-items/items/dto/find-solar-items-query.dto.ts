import { IntersectionType } from "@nestjs/swagger";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";
import { SearchQueryDto } from "../../../../common/dto/search-query.dto";
import { WithBudgetRange } from "../../../../common/dto/mixins/budget-range.dto";
import { WithSort } from "../../../../common/dto/mixins/with-sort.dto";
import { IsBoolean, IsOptional, IsString, IsUUID } from "class-validator";
import { TransformBoolean } from "../../../../common/transformers/boolean.transformer";

export class FindSolarItemsQueryDto extends IntersectionType(
    PaginationQueryDto,
    SearchQueryDto,
    WithBudgetRange(),
    WithSort(['selling_price', 'created_at'] as const, 'created_at')
) {
    @IsOptional()
    @IsBoolean()
    @TransformBoolean()
    readonly is_active?: boolean;

    @IsOptional()
    @IsString()
    @IsUUID('4')
    readonly category_id?: string;
}