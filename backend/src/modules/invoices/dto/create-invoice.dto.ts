import { IsDateString, IsNotEmpty } from "class-validator";
import { IsTodayOrFutureDate } from "../../../common/validators/is-today-or-future-date.validator";

export class CreateInvoiceDto {
    @IsNotEmpty()
    @IsDateString()
    @IsTodayOrFutureDate()
    readonly due_date!: string; 
}