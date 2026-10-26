import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, Min } from "class-validator";

export class UpdateStockDto {
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    readonly value!: number;
}