import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { QuotationsService } from "../quotations.service";

@Injectable()
export class QuotationExistsPipe implements PipeTransform {
    constructor(
        private readonly quotationService: QuotationsService,
    ) {}

    async transform(value: string, metadata: ArgumentMetadata) {
        return await this.quotationService.findById(value);
    }
}