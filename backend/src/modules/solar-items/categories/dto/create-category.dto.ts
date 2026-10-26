import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Trim, TrimCapitalize } from "../../../../common/transformers/trim.transformer";

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    @TrimCapitalize()
    readonly title!: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @Trim()
    readonly description?: string;
}