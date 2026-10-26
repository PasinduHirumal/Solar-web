import { IsNotEmpty, IsEmail, IsString, MinLength, MaxLength, IsOptional, IsBoolean } from "class-validator";
import { Trim, TrimLower } from "../../../../common/transformers/trim.transformer";
import { TransformBoolean } from "../../../../common/transformers/boolean.transformer";

export class LoginUserDto {
    @IsNotEmpty()
    @IsEmail()
    @TrimLower()
    readonly email!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    @Trim()
    readonly password!: string;

    @IsOptional()
    @IsBoolean()
    @TransformBoolean()
    readonly remember_me?: boolean;
}