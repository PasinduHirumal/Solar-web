import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { UserRole } from "../../enums/user.enum";
import { TrimCapitalize } from "../../../../common/transformers/trim.transformer";

export class UpdateUserDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    @TrimCapitalize()
    readonly name!: string;
}

export class UpdateUserRoleDto {
    @IsNotEmpty()
    @IsEnum(UserRole)
    readonly role!: UserRole;
}