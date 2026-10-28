import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ItemCategoryEntity } from "../../categories/entities/item-category.entity";

@Entity('solar_items')
@Index('UQ_solar_item_code',            ['code'], { unique: true })
@Index('UQ_solar_item_cat_title',       ['category_id', 'title'], { unique: true })
@Index('IDX_solar_item_created_active',             ['created_at', 'is_active'])
@Index('IDX_solar_item_created_category',           ['created_at', 'category_id'])
@Index('IDX_solar_item_created_category_active',    ['created_at', 'category_id', 'is_active'])
export class SolarItemEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    code!: string;

    @ManyToOne(() => ItemCategoryEntity, { eager: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'category_id' })
    category!: ItemCategoryEntity;

    @Column({ name: 'category_id', type: 'uuid' })
    category_id!: string;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    warranty_period!: string | null;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'float', default: 0 })
    marked_price!: number;

    @Column({ type: 'float', default: 0 })
    selling_price!: number;

    @Column({ type: 'float', default: 0 })
    quantity!: number;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}