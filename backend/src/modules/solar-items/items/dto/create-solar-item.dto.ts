import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { Trim, TrimCapitalize } from "../../../../common/transformers/trim.transformer";
import { Type } from "class-transformer";

export class CreateSolarItemDto {
    @IsNotEmpty()
    @IsString()
    @IsUUID('4')
    readonly category_id!: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    @MinLength(3)
    @TrimCapitalize()
    readonly title!: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @Trim()
    readonly description?: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    readonly marked_price!: number;
}