import { FileEntity } from "../entities/file.entity";

export const FILE_FIELDS: (keyof FileEntity)[] = [
    'id', 'mime_type', 'url', 'resource_type', 'description',
];
