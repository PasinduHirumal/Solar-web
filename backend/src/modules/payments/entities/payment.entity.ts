import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { InvoiceEntity } from "../../invoices/entities/invoice.entity";

export enum PaymentType {
    ADVANCE = 'ADVANCE',
    PARTIAL = 'PARTIAL',
    FULL = 'FULL',
    FINAL = 'FINAL',
}

@Entity('payments')
@Index('IDX_payment_created_invoice',    ['created_at', 'invoice_id'])
export class PaymentEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => InvoiceEntity, { eager: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'invoice_id' })
    invoice!: InvoiceEntity;
    
    @Column({ name: 'invoice_id', type: 'uuid' })
    invoice_id!: string;

    @Column({ type: 'float' })
    amount!: number;

    @Column({ type: 'enum', enum: PaymentType })
    payment_type!: PaymentType;

    @CreateDateColumn()
    created_at!: Date;
    
    @UpdateDateColumn()
    updated_at!: Date;
}