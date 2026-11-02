import { PickType } from "@nestjs/swagger";
import { CreateQuotationDto } from "./create-quotation.dto";

export class UpdateQuotationDataDto extends PickType(
    CreateQuotationDto, ['notes', 'terms',] as const
) {}