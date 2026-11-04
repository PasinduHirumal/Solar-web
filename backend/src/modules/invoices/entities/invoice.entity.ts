import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { QuotationEntity } from "../../quotations/entities/quotation.entity";
import { FileEntity } from "../../files/entities/file.entity";

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    ADVANCED = 'ADVANCED',
    PARTIAL = 'PARTIAL',
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
    @JoinColumn({ name: 'quotation_id' })
    quotation!: QuotationEntity;
    
    @Column({ name: 'quotation_id', type: 'uuid' })
    quotation_id!: string;

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    payment_status!: PaymentStatus;


    // Frozen at sent
    @Column({ type: 'float' })
    subtotal!: number;

    @Column({ type: 'float' })
    discount!: number;

    @Column({ type: 'float'})
    tax!: number;

    @Column({ type: 'float' })
    total!: number;


    // rest
    @Column({ type: 'timestamp' })
    due_date!: Date;

    @Column({ type: 'float', default: 0 })
    paid_amount!: number;

    @OneToOne(() => FileEntity, { eager: false, onDelete: 'RESTRICT', nullable: true })
    @JoinColumn({ name: 'invoice_pdf_id' })
    invoice_pdf!: FileEntity | null;

    @Column({ name: 'invoice_pdf_id', type: 'uuid', nullable: true})
    invoice_pdf_id!: string | null;

    @Column({ type: 'timestamp', nullable: true })
    price_updated_at!: Date | null;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}