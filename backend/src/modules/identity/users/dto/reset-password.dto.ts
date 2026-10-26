import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { IsPassword } from "../../../../common/validators/is-password.validator";
import { TrimLower } from "../../../../common/transformers/trim.transformer";

export class RequestEmailDto {
    @IsNotEmpty()
    @IsEmail()
    @TrimLower()
    readonly email!: string;
}

export class ResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    readonly token!: string;

    @IsNotEmpty()
    @IsString()
    @IsPassword()
    readonly new_password!: string;
}