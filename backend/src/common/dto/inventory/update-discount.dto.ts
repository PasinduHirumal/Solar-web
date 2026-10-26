import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, Max, Min } from "class-validator";
import { DiscountType } from "../../enums/discount-type.enum";
import { TrimUpper } from "../../transformers/trim.transformer";
import { IsDecimalRange } from "../../validators/is-decimal-range.validator";
import { Type } from "class-transformer";
import { IsTodayOrFutureDate } from "../../validators/is-today-or-future-date.validator";
import { TransformBoolean } from "../../transformers/boolean.transformer";

export class UpdateDiscountDto {
    @IsNotEmpty()
    @TrimUpper()
    @IsEnum(DiscountType)
    readonly discount_type!: DiscountType;

    @IsNotEmpty()
    @IsNumber()
    @Min(0.01)
    @Max(1_000_000)
    @IsDecimalRange(12, 2)
    @Type(() => Number)
    readonly value!: number;

    @IsNotEmpty()
    @IsDateString()
    @IsTodayOrFutureDate()
    readonly discount_ends_on!: string; 

    @IsNotEmpty()
    @IsBoolean()
    @TransformBoolean()
    readonly ignore_lost!: boolean;
}