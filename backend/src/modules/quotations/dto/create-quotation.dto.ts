import { IntersectionType } from "@nestjs/swagger";
import { RegisterUserAnonymous } from "../../identity/auth/dto/user-register.dto";
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MinLength, ValidateIf, ValidateNested } from "class-validator";
import { Trim } from "../../../common/transformers/trim.transformer";
import { DiscountType } from "../../../common/enums/discount-type.enum";
import { Type } from "class-transformer";
import { TaxType } from "../../../common/enums/tax-type.enum";
import { CreateQuotationItemDto } from "../quotation-items/dto/create-quotation-item.dto";
import { IsUniqueArrayByField } from "../../../common/validators/is-unique-array-by-field.validator";

export class CreateQuotationDto extends IntersectionType(RegisterUserAnonymous) {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @Trim()
    readonly notes?: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @Trim()
    readonly terms?: string;

    @IsOptional()
    @IsEnum(DiscountType)
    readonly discount_type?: DiscountType;

    @ValidateIf((o) => o.discount_type !== DiscountType.NON)
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    readonly discount!: number;

    @IsOptional()
    @IsEnum(TaxType)
    readonly tax_type?: TaxType;

    @ValidateIf((o) => o.discount_type !== TaxType.NON)
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    readonly tax!: number;

    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateQuotationItemDto)
    @IsUniqueArrayByField<CreateQuotationItemDto>('solar_item_id')
    readonly item_ids!: CreateQuotationItemDto[];
}