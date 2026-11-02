import { PickType } from "@nestjs/swagger";
import { CreateQuotationItemDto } from "./create-quotation-item.dto";

export class UpdateQuotationItemData extends PickType(
    CreateQuotationItemDto, ['quantity'] as const
) {}