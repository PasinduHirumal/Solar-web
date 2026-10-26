import { IsIn, IsOptional } from "class-validator";

export function WithSort<const T extends string>(columns: readonly T[], defaultColumn: T) {
    class Sort {
        @IsOptional()
        @IsIn(columns)
        readonly sort_by?: T = defaultColumn;

        @IsOptional()
        @IsIn(['ASC', 'DESC'])
        readonly sort_order?: 'ASC' | 'DESC' = 'DESC';
    }

    return Sort;
}