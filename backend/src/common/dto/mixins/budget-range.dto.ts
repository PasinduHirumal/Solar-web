import { Type } from "class-transformer";
import { IsNumber, IsOptional, Max, Min } from "class-validator";
import { IsNotLessThan } from "../../validators/is-budget-range-valid.validator";
import { IsDecimalRange } from "../../validators/is-decimal-range.validator";

export interface BudgetRangeOptions {
    min?: number;
    max?: number;
    precision?: number;
    scale?: number;
}

export function WithBudgetRange({ min = 0.01, max = 1_000_000, precision = 12, scale = 2 }: BudgetRangeOptions = {}) {
    if (max >= 10 ** (precision - scale)) {
        throw new Error(`WithBudgetRange: max (${max}) does not fit DECIMAL(${precision}, ${scale})`);
    }

    class BudgetRange {
        @IsOptional()
        @Type(() => Number)
        @IsNumber()
        @Min(min)
        @Max(max)
        @IsDecimalRange(precision, scale)
        readonly lowest_budget?: number;

        @IsOptional()
        @Type(() => Number)
        @IsNumber()
        @Min(min)
        @Max(max)
        @IsDecimalRange(precision, scale)
        @IsNotLessThan('lowest_budget')
        readonly maximum_budget?: number;
    }

    return BudgetRange;
}