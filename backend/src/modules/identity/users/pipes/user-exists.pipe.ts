import { ArgumentMetadata, Injectable, NotFoundException, PipeTransform } from "@nestjs/common";
import { AuthHelperService } from "../../auth/helpers/auth-helper.service";

@Injectable()
export class UserExistsPipe implements PipeTransform {
    constructor(
        private readonly authHelperService: AuthHelperService,
    ) {}

    async transform(value: string, metadata: ArgumentMetadata) {
        const user = await this.authHelperService.findEntityById(value);
        if (!user) throw new NotFoundException('User not found');

        return user;
    }
}