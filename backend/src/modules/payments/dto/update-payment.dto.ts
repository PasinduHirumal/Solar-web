import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Trim } from "../../../common/transformers/trim.transformer";

export class UpdatePaymentDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(500)
    @Trim()
    readonly revoked_reason!: string;
}