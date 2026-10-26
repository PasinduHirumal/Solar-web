import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'isDecimalRange', async: false })
export class IsDecimalRangeConstraint implements ValidatorConstraintInterface {
    validate(value: unknown, args: ValidationArguments): boolean {
        if (value === undefined || value === null) return true; // let @IsNotEmpty handle this
        if (typeof value !== 'number' || !Number.isFinite(value)) return false;

        const [precision, scale] = args.constraints as [number, number];
        const decimals = value.toString().split('.')[1]?.length ?? 0;

        return Math.abs(value) < 10 ** (precision - scale) && decimals <= scale;
    }

    defaultMessage(args: ValidationArguments): string {
        const [precision, scale] = args.constraints as [number, number];
        return `$property must have at most ${precision - scale} digits before and ${scale} after the decimal point`;
    }
}

export function IsDecimalRange(precision: number, scale: number, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [precision, scale], // this is what args.constraints receives
            validator: IsDecimalRangeConstraint,
        });
    };
}