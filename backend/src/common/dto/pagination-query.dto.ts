import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class PaginationQueryDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    readonly page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    readonly limit?: number = 10;
}