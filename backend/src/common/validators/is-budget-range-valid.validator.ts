import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'isNotLessThan', async: false })
export class IsNotLessThanConstraint implements ValidatorConstraintInterface {
    validate(value: unknown, args: ValidationArguments): boolean {
        const [relatedProp] = args.constraints as [string];
        const relatedValue = (args.object as Record<string, unknown>)[relatedProp];

        // missing or non-numeric values are reported by @IsOptional / @IsNumber
        if (typeof value !== 'number' || typeof relatedValue !== 'number') return true;
        if (!Number.isFinite(value) || !Number.isFinite(relatedValue)) return true;

        return value >= relatedValue;
    }

    defaultMessage(): string {
        return '$property cannot be less than $constraint1';
    }
}

export function IsNotLessThan(property: string, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: IsNotLessThanConstraint,
        });
    };
}