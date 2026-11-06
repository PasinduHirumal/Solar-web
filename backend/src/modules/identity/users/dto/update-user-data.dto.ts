import { PickType } from "@nestjs/swagger";
import { RegisterUserAnonymous } from "../../auth/dto/user-register.dto";

export class UpdateUserDataDto extends PickType(
    RegisterUserAnonymous, ['phone', 'address'] as const
) {}