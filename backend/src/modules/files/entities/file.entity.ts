import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CloudinaryResourceType } from "../../../common/enums/file-resources-type.enum";

@Entity('files')
@Index('UQ_files_public_id',    ['public_id'], { unique: true })
export class FileEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 500 })
    original_name!: string;

    @Column({ type: 'varchar', length: 100 })
    mime_type!: string;

    @Column({ type: 'int' })
    size!: number;

    @Column({ type: 'text' })
    url!: string;

    @Column({ type: 'varchar', length: 500 })
    public_id!: string;

    @Column({ type: 'enum', enum: CloudinaryResourceType, default: CloudinaryResourceType.IMAGE })
    resource_type!: CloudinaryResourceType;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}