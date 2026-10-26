import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { CategoriesService } from "../categories.service";

@Injectable()
export class ItemCategoryExistsPipe implements PipeTransform {
    constructor(
        private readonly categoriesService: CategoriesService,
    ) {}

    async transform(value: string, metadata: ArgumentMetadata) {
        return await this.categoriesService.findById(value);
    }
}