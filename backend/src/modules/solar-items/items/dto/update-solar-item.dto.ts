import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateSolarItemDto } from "./create-solar-item.dto";

export class UpdateSolarItemDto extends PartialType(
    OmitType(CreateSolarItemDto, ['marked_price'] as const)
) {}