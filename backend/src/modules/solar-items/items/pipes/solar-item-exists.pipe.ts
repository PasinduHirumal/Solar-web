import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { ItemsService } from "../items.service";

@Injectable()
export class SolarItemExistsPipe implements PipeTransform {
    constructor(
        private readonly itemsService: ItemsService,
    ) {}

    async transform(value: string, metadata: ArgumentMetadata) {
        return await this.itemsService.findById(value);
    }
}