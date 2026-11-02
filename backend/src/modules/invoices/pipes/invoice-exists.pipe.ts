import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { InvoicesService } from "../invoices.service";

@Injectable()
export class InvoiceExistsPipe implements PipeTransform {
    constructor(
        private readonly invoiceService: InvoicesService,
    ) {}

    async transform(value: string, metadata: ArgumentMetadata) {
        return await this.invoiceService.findById(value);
    }
}