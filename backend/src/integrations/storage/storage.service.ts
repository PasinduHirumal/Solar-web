import { Injectable, Logger } from '@nestjs/common';
import { CloudinaryResourceType } from '../../common/enums/file-resources-type.enum';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { randomUUID } from 'crypto';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);

    constructor(
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
        this.logger.log(`Uploading file: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);

        const resourceType = this.resolveResourceType(file.mimetype);
        const publicId = this.generatePublicId(file.originalname);

        try {
            const response = await this.cloudinaryService.uploadFile(file, resourceType, publicId);
            this.logger.log(`Successfully uploaded to Cloudinary: ${file.originalname}`);
            return response;
        } catch (error) {
            this.logger.error(`Failed to upload file: ${file.originalname}`, (error as Error).stack);
            throw error;
        }
    }

    async uploadMultipleFiles(files: Express.Multer.File[]): Promise<UploadApiResponse[]> {
        this.logger.log(`Starting upload of ${files.length} file(s)`);

        const uploaded: UploadApiResponse[] = [];

        try {
            const responses = await Promise.all(
                files.map(async (file) => {
                    const resourceType = this.resolveResourceType(file.mimetype);
                    const publicId = this.generatePublicId(file.originalname);
                    const response = await this.cloudinaryService.uploadFile(file, resourceType, publicId);
                    uploaded.push(response);
                    return response;
                })
            );

            this.logger.log(`Successfully uploaded ${responses.length} file(s)`);
            return responses;
        } catch (error) {
            this.logger.error(`Upload batch failed. Rolling back ${uploaded.length} file(s)`, (error as Error).stack);

            if (uploaded.length > 0) {
                await Promise.all(
                    uploaded.map((res) =>
                        this.cloudinaryService.deleteFile(res.public_id, res.resource_type).catch((err) => {
                            this.logger.error(`Failed to delete ${res.public_id} during rollback`, err.stack);
                        })
                    )
                );
                this.logger.warn(`Rolled back ${uploaded.length} file(s) from Cloudinary`);
            }

            throw error;
        }
    }

    async deleteFile(publicId: string, resourceType: CloudinaryResourceType): Promise<void> {
        this.logger.log(`Deleting from Cloudinary: ${publicId}`);
        await this.cloudinaryService.deleteFile(publicId, resourceType);
    }

    
    // helpers
    private resolveResourceType(mimeType: string): CloudinaryResourceType {
        if (mimeType.startsWith('image/')) return CloudinaryResourceType.IMAGE;
        if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) return CloudinaryResourceType.VIDEO;
        return CloudinaryResourceType.RAW;
    }

    private generatePublicId(originalName: string): string {
        const extension = originalName.split('.').pop();
        return extension ? `${randomUUID()}.${extension}` : randomUUID();
    }
}
