import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isUniqueArrayByField', async: false })
export class IsUniqueArrayByFieldConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments): boolean {
        if (!Array.isArray(value)) {
            return true;
        }

        const [field] = args.constraints as [string];

        const normalizedValues = value
            .map((item) => item?.[field])
            .filter((v): v is string | number => typeof v === 'string' || typeof v === 'number')
            .map((v) => (typeof v === 'string' ? v.trim().toUpperCase() : v));

        const uniqueValues = new Set(normalizedValues);

        return uniqueValues.size === normalizedValues.length;
    }

    defaultMessage(args: ValidationArguments): string {
        const [field] = args.constraints as [string];
        return `Duplicate ${field} values are not allowed`;
    }
}

export function IsUniqueArrayByField<T extends object>(
    field: keyof T & string,
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [field],
            validator: IsUniqueArrayByFieldConstraint,
        });
    };
}