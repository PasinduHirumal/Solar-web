import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from "class-validator";
import { DiscountType } from "../../../common/enums/discount-type.enum";
import { Type } from "class-transformer";

export class UpdateQuotationDiscountDto {
    @IsNotEmpty()
    @IsEnum(DiscountType)
    readonly discount_type!: DiscountType;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    readonly discount!: number;
}