import { IntersectionType } from "@nestjs/swagger";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { SearchQueryDto } from "../../../common/dto/search-query.dto";
import { WithSort } from "../../../common/dto/mixins/with-sort.dto";
import { IsEnum, IsOptional } from "class-validator";
import { QuotationStatus } from "../entities/quotation.entity";

export class FindQuotationsQueryDto extends IntersectionType(
    PaginationQueryDto,
    SearchQueryDto,
    WithSort(['created_at'] as const, 'created_at'),
) {
    @IsOptional()
    @IsEnum(QuotationStatus)
    readonly status?: QuotationStatus;
}