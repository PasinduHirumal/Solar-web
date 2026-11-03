import { IntersectionType } from "@nestjs/swagger";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { WithSort } from "../../../common/dto/mixins/with-sort.dto";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class FindPaymentsQueryDto extends IntersectionType(
    PaginationQueryDto,
    WithSort(['created_at'] as const, 'created_at'),
) {
    @IsNotEmpty()
    @IsString()
    @IsUUID('4')
    readonly invoice_id!: string;
}