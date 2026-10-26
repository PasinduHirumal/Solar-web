import { Injectable, Logger, ParseFilePipeBuilder, PipeTransform } from '@nestjs/common';
import { MAX_FILE_SIZE } from '../../../common/constants/file-size.constant';
import { CustomFileTypeValidator } from '../../../common/validators/custom-file-type.validator';
import { IMAGE_MIME_TYPES } from '../../../common/constants/file-types.constant';

@Injectable()
export class ParseFileFieldsPipe implements PipeTransform {
    private readonly logger = new Logger(ParseFileFieldsPipe.name);

    private readonly filePipe = new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE.IMAGE })
        .addValidator(new CustomFileTypeValidator([...IMAGE_MIME_TYPES]))
        .build({ fileIsRequired: true });

    async transform(files?: Record<string, Express.Multer.File[]>) {
        if (!files) return files;
        
        this.logger.debug(
            JSON.stringify(
                Object.entries(files).map(([field, list]) => ({
                    field,
                    files: list.map((f) => ({ name: f.originalname, size: f.size, mime: f.mimetype })),
                })),
            ),
        );

        if (!files) return files;

        await Promise.all(
            Object.values(files).flat().map((file) => this.filePipe.transform(file)),
        );

        return files;
    }
}