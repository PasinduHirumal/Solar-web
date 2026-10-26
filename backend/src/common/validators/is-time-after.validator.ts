import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

function toSeconds(value: unknown): number | null {
    if (typeof value !== 'string') return null;
    const [h, m, s = '0'] = value.split(':');
    const parts = [Number(h), Number(m), Number(s)];
    if (parts.some(Number.isNaN)) return null;
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

export function IsTimeAfter(property: string, validationOptions?: ValidationOptions) {
    return (object: object, propertyName: string) => {
        registerDecorator({
            name: 'isTimeAfter',
            target: object.constructor,
            propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: unknown, args: ValidationArguments) {
                    const [relatedProp] = args.constraints;
                    const related = (args.object as Record<string, unknown>)[relatedProp];
                    const end = toSeconds(value);
                    const start = toSeconds(related);

                    // If either is missing/malformed, the other validators report it
                    if (end === null || start === null) return true;

                    return end > start;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be later than ${args.constraints[0]}`;
                },
            },
        });
    };
}