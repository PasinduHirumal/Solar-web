import { FileTypeValidator } from '@nestjs/common';

export class CustomFileTypeValidator extends FileTypeValidator {
    private allowedMimeTypes: string[];

    constructor(allowedMimeTypes: string[]) {
        super({ fileType: '' });
        this.allowedMimeTypes = allowedMimeTypes;
    }

    buildErrorMessage(): string {
        return `Validation failed. Allowed file types: ${this.allowedMimeTypes.join(', ')}`;
    }

    async isValid(file?: Express.Multer.File): Promise<boolean> {
        if (!file?.mimetype) return false;
        return this.allowedMimeTypes.includes(file.mimetype);
    }
}