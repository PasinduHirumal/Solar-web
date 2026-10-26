import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
    validate(value: string | Date | null | undefined): boolean {
        if (value === undefined || value === null || value === '') return true;

        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return false; // invalid date

        return date.getTime() > Date.now();
    }

    defaultMessage(): string {
        return '$property must be a future date';
    }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsFutureDateConstraint,
        });
    };
}