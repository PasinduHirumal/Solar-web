import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { TrimCapitalize, TrimLower } from "../../../../common/transformers/trim.transformer";
import { IsPassword } from "../../../../common/validators/is-password.validator";
import { UserRole } from "../../enums/user.enum";
import { OmitType } from "@nestjs/swagger";

export class RegisterUserDto {
    @IsNotEmpty()
    @IsEmail()
    @TrimLower()
    readonly email!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    @TrimCapitalize()
    readonly name!: string;

    @IsNotEmpty()
    @IsString()
    @IsPassword()
    readonly password!: string;

    @IsOptional()
    @IsEnum(UserRole)
    readonly role?: UserRole;
}

export class RegisterUserAnonymous extends OmitType(
    RegisterUserDto, ['password', 'role']
) {}