export const pick = (alias: string, fields: readonly string[]): string[] =>
    fields.map((field) => `${alias}.${field}`);