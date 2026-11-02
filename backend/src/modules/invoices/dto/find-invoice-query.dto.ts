import { IntersectionType } from "@nestjs/swagger";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { SearchQueryDto } from "../../../common/dto/search-query.dto";
import { WithSort } from "../../../common/dto/mixins/with-sort.dto";
import { PaymentStatus } from "../entities/invoice.entity";
import { IsEnum, IsOptional } from "class-validator";

export class FindInvoicesQueryDto extends IntersectionType(
    PaginationQueryDto,
    SearchQueryDto,
    WithSort(['created_at'] as const, 'created_at'),
) {
    @IsOptional()
    @IsEnum(PaymentStatus)
    readonly payment_status?: PaymentStatus;
}