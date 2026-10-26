import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

const PASSWORD_RULES = [
    { regex: /^.{8,128}$/,    message: 'Password must be between 8 and 128 characters' },
    { regex: /[a-z]/,         message: 'Password must contain at least one lowercase letter' },
    { regex: /[A-Z]/,         message: 'Password must contain at least one uppercase letter' },
    { regex: /[0-9]/,         message: 'Password must contain at least one number' },
    { regex: /[^A-Za-z0-9]/, message: 'Password must contain at least one special character' },
    { regex: /^\S*$/,         message: 'Password must not contain spaces' },
] as const;

@ValidatorConstraint({ name: 'isPassword', async: false })
export class IsPasswordConstraint implements ValidatorConstraintInterface {
    private failedMessage = '';

    validate(value: string): boolean {
        if (!value) return true;  // let @IsNotEmpty handle empty check

        const failed = PASSWORD_RULES.find(rule => !rule.regex.test(value));
        if (failed) {
            this.failedMessage = failed.message;
            return false;
        }
        return true;
    }

    defaultMessage(): string {
        return this.failedMessage;
    }
}

export function IsPassword(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target:       object.constructor,
            propertyName,
            options:      validationOptions,
            constraints:  [],
            validator:    IsPasswordConstraint,
        });
    };
}