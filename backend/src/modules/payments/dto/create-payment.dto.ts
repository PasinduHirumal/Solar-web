import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, Min } from "class-validator";
import { PaymentType } from "../entities/payment.entity";

export class CreatePaymentDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(0.1)
    @Type(() => Number)
    readonly amount!: number;

    @IsNotEmpty()
    @IsEnum(PaymentType)
    readonly payment_type!: PaymentType;
}