import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { QuotationEntity } from "../../quotations/entities/quotation.entity";

export enum PaymentStatus {
    NOT_PAID = 'NOT_PAID',
    PAID = 'PAID',
    ADVANCED = 'ADVANCED',
}

@Entity('invoices')
@Index('UQ_invoice_number',     ['invoice_number'], { unique: true })
@Index('IDX_invoice_created_status',    ['created_at', 'payment_status'])
export class InvoiceEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    invoice_number!: string;

    @OneToOne(() => QuotationEntity, { eager: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'customer_id' })
    quotation!: QuotationEntity;
    
    @Column({ name: 'quotation_id', type: 'uuid' })
    quotation_id!: string;

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.NOT_PAID })
    payment_status!: PaymentStatus;


    // Frozen at accepted
    @Column({ type: 'float' })
    subtotal!: number;

    @Column({ type: 'float' })
    discount!: number;

    @Column({ type: 'float'})
    tax!: number;

    @Column({ type: 'float' })
    total!: number;

    @Column({ type: 'timestamp' })
    due_date!: Date;

    @Column({ type: 'float', nullable: true })
    paid_amount!: number | null;

    @Column({ type: 'timestamp', nullable: true })
    paid_at!: Date | null;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}