import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SolarItemEntity } from "../../../solar-items/items/entities/solar-items.entity";
import { QuotationEntity } from "../../entities/quotation.entity";

@Entity('quotation_items')
@Index('UQ_quotation_item',             ['quotation_id', 'solar_item_id'], { unique: true })
@Index('IDX_quotation_item_quotation',  ['quotation_id'])
@Index('IDX_quotation_item_solar_item', ['solar_item_id'])
export class QuotationItemEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => QuotationEntity, (q) => q.items, { eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'quotation_id' })
    quotation!: QuotationEntity;

    @Column({ name: 'quotation_id', type: 'uuid' })
    quotation_id!: string;

    @ManyToOne(() => SolarItemEntity, { eager: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'solar_item_id' })
    solar_item!: SolarItemEntity;

    @Column({ name: 'solar_item_id', type: 'uuid' })
    solar_item_id!: string;

    @Column({ type: 'float', default: 1 })
    quantity!: number;


    // snap of solar-item
    @Column({ type: 'varchar', length: 255, nullable: true })
    snap_title!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    snap_warranty_period!: string | null;

    @Column({ type: 'text', nullable: true })
    snap_warranty_details!: string | null;

    @Column({ type: 'float', default: 0 })
    snap_selling_price!: number;
}