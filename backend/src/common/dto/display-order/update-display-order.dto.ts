import { IsEnum, IsNotEmpty } from "class-validator";
import { TrimUpper } from "../../transformers/trim.transformer";
import { PositionChange } from "../../enums/display-order.enum";

export class UpdateDisplayOrderDto {
    @IsNotEmpty()
    @TrimUpper()
    @IsEnum(PositionChange)
    readonly change_position!: PositionChange;
}