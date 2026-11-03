import { IntersectionType } from "@nestjs/swagger";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { SearchQueryDto } from "../../../common/dto/search-query.dto";
import { WithSort } from "../../../common/dto/mixins/with-sort.dto";
import { PaymentStatus } from "../entities/invoice.entity";
import { IsEnum, IsOptional } from "class-validator";
import { WithBudgetRange } from "../../../common/dto/mixins/budget-range.dto";
import { WithDateRange } from "../../../common/dto/mixins/date-range.dto";

export class FindInvoicesQueryDto extends IntersectionType(
    PaginationQueryDto,
    SearchQueryDto,
    WithBudgetRange(),
    WithDateRange(),
    WithSort(['created_at'] as const, 'created_at'),
) {
    @IsOptional()
    @IsEnum(PaymentStatus)
    readonly payment_status?: PaymentStatus;
}