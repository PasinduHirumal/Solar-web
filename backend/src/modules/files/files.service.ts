import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { Repository } from 'typeorm';
import { StorageService } from '../../integrations/storage/storage.service';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryResourceType } from '../../common/enums/file-resources-type.enum';

@Injectable()
export class FilesService {
    private readonly logger = new Logger(FilesService.name);

    constructor(
        @InjectRepository(FileEntity)
        private readonly fileRepository: Repository<FileEntity>,

        private readonly storageService: StorageService,
    ) {}

    async uploadFile(file: Express.Multer.File, description: string | undefined): Promise<FileEntity> {
        let cloudinaryResponse: UploadApiResponse;

        try {
            cloudinaryResponse = await this.storageService.uploadFile(file);
        } catch (error) {
            this.logger.error(`Failed to upload file "${file.originalname}" to storage`, error instanceof Error ? error.stack : error);
            throw new InternalServerErrorException(`Failed to upload file "${file.originalname}"`);
        }

        try {
            const newFile = this.fileRepository.create(
                this.toFileEntityData(file, cloudinaryResponse, description)
            );

            const savedFile = await this.fileRepository.save(newFile);
            this.logger.log(`Saved file record: ${file.originalname} with ID: ${savedFile.id}`);

            return savedFile;
        } catch (error) {
            this.logger.error(`Failed to save file record for "${file.originalname}"`, error instanceof Error ? error.stack : error);

            // Best-effort cleanup so we don't leave an orphaned file in storage
            try {
                await this.storageService.deleteFile(cloudinaryResponse.public_id, this.mapResourceType(cloudinaryResponse.resource_type));
            } catch (cleanupError) {
                this.logger.error(
                    `Failed to roll back storage upload for "${file.originalname}" (public_id: ${cloudinaryResponse.public_id})`,
                    cleanupError instanceof Error ? cleanupError.stack : cleanupError,
                );
            }

            throw new InternalServerErrorException(`Failed to save file record for "${file.originalname}"`);
        }
    }

    async uploadMultipleFiles(files: Express.Multer.File[], description: string | undefined): Promise<FileEntity[]> {
        let cloudinaryResponses: UploadApiResponse[];

        try {
            cloudinaryResponses = await this.storageService.uploadMultipleFiles(files);
        } catch (error) {
            this.logger.error(`Failed to upload ${files.length} file(s) to storage`, error instanceof Error ? error.stack : error);
            throw new InternalServerErrorException('Failed to upload files');
        }

        try {
            const newFiles = cloudinaryResponses.map((response, i) =>
                this.fileRepository.create(
                    this.toFileEntityData(files[i], response, description)
                )
            );

            const savedFiles = await this.fileRepository.save(newFiles);
            this.logger.log(`Saved ${savedFiles.length} file record(s)`);

            return savedFiles;
        } catch (error) {
            this.logger.error(`Failed to save ${cloudinaryResponses.length} file record(s)`, error instanceof Error ? error.stack : error);

            // Best-effort cleanup of all uploaded files
            await Promise.allSettled(
                cloudinaryResponses.map((response) =>
                    this.storageService.deleteFile(response.public_id, this.mapResourceType(response.resource_type)),
                ),
            ).then((results) => {
                results.forEach((result, i) => {
                    if (result.status === 'rejected') {
                        this.logger.error(
                            `Failed to roll back storage upload for "${files[i].originalname}" (public_id: ${cloudinaryResponses[i].public_id})`,
                            result.reason,
                        );
                    }
                });
            });

            throw new InternalServerErrorException('Failed to save file records');
        }
    }

    async deleteFile(file_id: string): Promise<void> {
        let fileToBeDeleted: FileEntity | null;

        try {
            fileToBeDeleted = await this.fileRepository.findOne({
                where: { id: file_id.trim() },
            });
        } catch (error) {
            this.logger.error(`Failed to look up file with ID ${file_id}`, error instanceof Error ? error.stack : error);
            throw new InternalServerErrorException(`Failed to look up file with ID ${file_id}`);
        }

        if (!fileToBeDeleted) {
            this.logger.warn(`File with ID ${file_id} not found`);
            throw new NotFoundException(`File with ID ${file_id} not found`);
        }

        try {
            await this.storageService.deleteFile(fileToBeDeleted.public_id, fileToBeDeleted.resource_type);
        } catch (error) {
            this.logger.error(
                `Failed to delete file "${fileToBeDeleted.original_name}" (public_id: ${fileToBeDeleted.public_id}) from storage`,
                error instanceof Error ? error.stack : error,
            );
            throw new InternalServerErrorException(`Failed to delete file "${fileToBeDeleted.original_name}" from storage`);
        }

        try {
            await this.fileRepository.remove(fileToBeDeleted);
        } catch (error) {
            this.logger.error(
                `File "${fileToBeDeleted.original_name}" was removed from storage but failed to delete DB record (ID: ${file_id})`,
                error instanceof Error ? error.stack : error,
            );
            throw new InternalServerErrorException(`Failed to delete file record for "${fileToBeDeleted.original_name}"`);
        }

        this.logger.log(`Successfully deleted file: ${fileToBeDeleted.original_name} (ID: ${file_id})`);
    }

    async deleteMultipleFiles(file_ids: string[]): Promise<void> {
        const errors: { file_id: string; error: unknown }[] = [];

        for (const file_id of file_ids) {
            try {
                await this.deleteFile(file_id);
            } catch (error) {
                errors.push({ file_id, error });
            }
        }

        if (errors.length > 0) {
            errors.forEach(({ file_id, error }) => {
                this.logger.error(`Failed to delete file with ID ${file_id}`, error instanceof Error ? error.stack : error);
            });
            throw new InternalServerErrorException(
                `Failed to delete ${errors.length} of ${file_ids.length} file(s): ${errors.map((e) => e.file_id).join(', ')}`,
            );
        }

        this.logger.log(`Successfully deleted ${file_ids.length} file(s)`);
    }
    

    // helpers
    private toFileEntityData(file: Express.Multer.File, response: UploadApiResponse, description: string | undefined) {
        return {
            original_name: file.originalname,
            mime_type: file.mimetype,
            size: file.size,
            public_id: response.public_id,
            url: response.secure_url,
            resource_type: this.mapResourceType(response.resource_type),
            description,
        };
    }

    private mapResourceType(resourceType: string): CloudinaryResourceType {
        switch (resourceType) {
            case 'image':
                return CloudinaryResourceType.IMAGE;
            case 'video':
                return CloudinaryResourceType.VIDEO;
            case 'raw':
                return CloudinaryResourceType.RAW;
            default:
                this.logger.warn(`Unexpected Cloudinary resource_type "${resourceType}", defaulting to RAW`);
                return CloudinaryResourceType.RAW;
        }
    }
}