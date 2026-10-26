import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isUniqueArrayByFields', async: false })
export class IsUniqueArrayByFieldsConstraint implements ValidatorConstraintInterface {
    validate(value: unknown, args: ValidationArguments): boolean {
        if (!Array.isArray(value)) {
            return true;
        }

        const [fields] = args.constraints as [string[]];
        const seen = new Set<string>();

        for (const item of value) {
            const parts: (string | number)[] = [];

            for (const field of fields) {
                const v = item?.[field];

                if (typeof v === 'string') {
                    parts.push(v.trim().toUpperCase());
                } else if (typeof v === 'number') {
                    parts.push(v);
                } else {
                    parts.length = 0;
                    break;
                }
            }

            // Skip items with a missing/invalid field; other validators report those
            if (parts.length !== fields.length) {
                continue;
            }

            const key = JSON.stringify(parts);

            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
        }

        return true;
    }

    defaultMessage(args: ValidationArguments): string {
        const [fields] = args.constraints as [string[]];
        const [mainField, ...otherFields] = fields;

        return otherFields.length
            ? `Duplicate ${mainField} with the same ${otherFields.join(', ')} is not allowed`
            : `Duplicate ${mainField} values are not allowed`;
    }
}

export function IsUniqueArrayByFields(
    fields: readonly [string, ...string[]],
    validationOptions?: ValidationOptions,
) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [fields],
            validator: IsUniqueArrayByFieldsConstraint,
        });
    };
}