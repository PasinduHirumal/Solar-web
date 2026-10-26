import { Transform } from "class-transformer";

export const TrimUpper = () =>
    Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value);

export const TrimLower = () =>
    Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value);

export const Trim = () =>
    Transform(({ value }) => typeof value === 'string' ? value.trim() : value);

export const TrimCapitalize = () =>
    Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim().replace(/\b\w/g, (char) => char.toUpperCase())
            : value
    );