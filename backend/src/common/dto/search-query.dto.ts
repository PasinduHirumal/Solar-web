import { IsOptional, IsString, MaxLength } from "class-validator";
import { Trim } from "../transformers/trim.transformer";

export class SearchQueryDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    @Trim()
    readonly search_term?: string;
}