import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, Max, Min } from "class-validator";
import { IsDecimalRange } from "../../validators/is-decimal-range.validator";

export class UpdatePriceDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(0.01)
    @Max(1_000_000)
    @IsDecimalRange(12, 2)
    @Type(() => Number)
    readonly price!: number;
}