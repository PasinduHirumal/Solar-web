import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('item_categories')
@Index('UQ_item_cat_title',              ['title'], { unique: true })
@Index('IDX_item_cat_active_created',    ['is_active', 'created_at'])
@Index('IDX_item_cat_active_title',      ['is_active', 'title'])
export class ItemCategoryEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}