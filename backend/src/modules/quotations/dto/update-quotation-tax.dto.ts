import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from "class-validator";
import { TaxType } from "../../../common/enums/tax-type.enum";
import { Type } from "class-transformer";

export class UpdateQuotationTaxDto {
    @IsNotEmpty()
    @IsEnum(TaxType)
    readonly tax_type!: TaxType;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    readonly tax!: number;
}