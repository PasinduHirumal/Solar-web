import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

@ValidatorConstraint({ name: "isPhoneNumberMultiRegion", async: false })
class IsPhoneNumberMultiRegionConstraint implements ValidatorConstraintInterface {
    validate(value: unknown, args: ValidationArguments): boolean {
        if (typeof value !== "string") return false;

        const regions = args.constraints[0] as CountryCode[];

        return regions.some((region) => {
            try {
                const parsed = parsePhoneNumberFromString(value, region);
                // Confirm the resolved country is actually one of the allowed regions —
                // isValidPhoneNumber alone would accept any valid E.164 number regardless
                // of which country it belongs to, since region is only a fallback default.
                return !!parsed && parsed.isValid() && !!parsed.country && regions.includes(parsed.country);
            } catch {
                return false;
            }
        });
    }

    defaultMessage(args: ValidationArguments): string {
        const regions = (args.constraints[0] as CountryCode[]).join(", ");
        return `${args.property} must be a valid phone number for one of the following regions: ${regions}`;
    }
}

export function IsPhoneNumberMultiRegion(
    regions: CountryCode[],
    validationOptions?: ValidationOptions,
) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [regions],
            validator: IsPhoneNumberMultiRegionConstraint,
        });
    };
}