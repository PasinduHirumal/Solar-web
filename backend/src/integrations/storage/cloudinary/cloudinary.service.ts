import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CloudinaryResourceType } from "../../../common/enums/file-resources-type.enum";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    constructor(
        @Inject('CLOUDINARY')
        private readonly cloudinary: any,

        private readonly configService: ConfigService,
    ) {}

    async uploadFile(file: Express.Multer.File, resourceType: CloudinaryResourceType, publicId?: string): Promise<UploadApiResponse> {
        const APP_NAME = this.configService.get<string>('APP_NAME');
        
        return new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream({
                    folder: APP_NAME,
                    resource_type: resourceType,
                    public_id: publicId,
                    timeout: 2 * 60 * 1000
                },
                (error: UploadApiErrorResponse, result: UploadApiResponse) => {
                    if (error) reject(error);
                    resolve(result);
                }
            );

            Readable.from(file.buffer).pipe(uploadStream);
        });
    }

    async deleteFile(publicId: string, resourceType: string): Promise<any> {
        return this.cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }
}