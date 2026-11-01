import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "../../identity/entities/user.entity";
import { QuotationItemEntity } from "../quotation-items/entities/quotation-item.entity";
import { DiscountType } from "../../../common/enums/discount-type.enum";
import { TaxType } from "../../../common/enums/tax-type.enum";

export enum QuotationStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}

@Entity('quotations')
@Index('UQ_quotation_number',               ['quotation_number'], { unique: true })
@Index('IDX_quotation_created_status',      ['created_at', 'status'])
export class QuotationEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    quotation_number!: string;

    @Column({ type: 'enum', enum: QuotationStatus, default: QuotationStatus.DRAFT })
    status!: QuotationStatus;

    @ManyToOne(() => UserEntity, { eager: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'customer_id' })
    customer!: UserEntity;

    @Column({ name: 'customer_id', type: 'uuid' })
    customer_id!: string;

    @Column({ type: 'text', nullable: true })
    notes!: string | null;

    @Column({ type: 'text', nullable: true })
    terms!: string | null;

    @OneToMany(() => QuotationItemEntity, (item) => item.quotation, { cascade: ['insert'] })
    items!: QuotationItemEntity[];

    @Column({ type: 'enum', enum: DiscountType, default: DiscountType.NON })
    discount_type!: DiscountType;

    @Column({ type: 'float', default: 0 })
    discount!: number;

    @Column({ type: 'enum', enum: TaxType, default: TaxType.NON })
    tax_type!: TaxType;

    @Column({ type: 'float', default: 0 })
    tax!: number;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}