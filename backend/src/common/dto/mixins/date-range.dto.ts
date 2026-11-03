import { IsDateString, IsOptional, Matches } from "class-validator";
import { IsAfterDate } from "../../validators/is-after-date.validator";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_ONLY_MESSAGE = '$property must be in YYYY-MM-DD format';

export function WithDateRange() {
    class DateRange {
        @IsOptional()
        @IsDateString({ strict: true })
        @Matches(DATE_ONLY, { message: DATE_ONLY_MESSAGE })
        readonly start_date?: string;

        @IsOptional()
        @IsDateString({ strict: true })
        @Matches(DATE_ONLY, { message: DATE_ONLY_MESSAGE })
        @IsAfterDate('start_date')
        readonly end_date?: string;
    }

    return DateRange;
}