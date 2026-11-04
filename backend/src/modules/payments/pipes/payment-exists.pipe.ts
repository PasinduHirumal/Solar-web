import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { PaymentsService } from "../payments.service";

@Injectable()
export class PaymentExistsPipe implements PipeTransform {
    constructor(
        private readonly paymentService: PaymentsService,
    ) {}

    async transform(value: string, metadata: ArgumentMetadata) {
        return await this.paymentService.findById(value);
    }
}