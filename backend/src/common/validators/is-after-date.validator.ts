import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

type DateInput = string | Date | null | undefined;

function toDate(value: DateInput): Date | null {
    if (value === undefined || value === null || value === '') return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

@ValidatorConstraint({ name: 'isAfterDate', async: false })
export class IsAfterDateConstraint implements ValidatorConstraintInterface {
    validate(value: DateInput, args: ValidationArguments): boolean {
        const [relatedProp] = args.constraints as [string];
        const relatedValue = (args.object as Record<string, DateInput>)[relatedProp];

        // let @IsNotEmpty / @IsOptional handle missing values
        if (value === undefined || value === null || value === '') return true;
        if (relatedValue === undefined || relatedValue === null || relatedValue === '') return true;

        const date = toDate(value);
        if (!date) return false; // this field is not a valid date

        const relatedDate = toDate(relatedValue);
        if (!relatedDate) return true; // the related field's own validators report that

        return date.getTime() > relatedDate.getTime();
    }

    defaultMessage(): string {
        return '$property must be after $constraint1';
    }
}

export function IsAfterDate(property: string, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: IsAfterDateConstraint,
        });
    };
}