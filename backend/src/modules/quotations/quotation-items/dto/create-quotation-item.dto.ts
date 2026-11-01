import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from "class-validator";

export class CreateQuotationItemDto {
    @IsNotEmpty()
    @IsString()
    @IsUUID('4')
    readonly solar_item_id!: string;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    readonly quantity!: number;
}