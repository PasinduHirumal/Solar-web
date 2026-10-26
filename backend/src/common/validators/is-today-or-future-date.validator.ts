import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'isTodayOrFutureDate', async: false })
export class IsTodayOrFutureDateConstraint implements ValidatorConstraintInterface {
    validate(value: string): boolean {
        if (!value) return true;  // let @IsNotEmpty handle empty check

        const input = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);  // strip time — compare dates only

        return input >= today;
    }

    defaultMessage(): string {
        return '$property must be today or a future date';
    }
}

export function IsTodayOrFutureDate(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target:       object.constructor,
            propertyName,
            options:      validationOptions,
            constraints:  [],
            validator:    IsTodayOrFutureDateConstraint,
        });
    };
}