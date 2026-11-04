import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { InvoiceEntity } from "../../invoices/entities/invoice.entity";
import { UserEntity } from "../../identity/entities/user.entity";

export enum PaymentType {
    ADVANCE = 'ADVANCE',
    PARTIAL = 'PARTIAL',
    FULL = 'FULL',
    FINAL = 'FINAL',
}

export enum InvoicePaymentStatus {
    PAID = 'PAID',
    REVOKED = 'REVOKED',
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

    @ManyToOne(() => UserEntity, { eager: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'authorized_admin_id' })
    authorized_admin!: UserEntity;
    
    @Column({ name: 'authorized_admin_id', type: 'uuid' })
    authorized_admin_id!: string;

    @Column({ type: 'enum', enum: InvoicePaymentStatus, default: InvoicePaymentStatus.PAID })
    status!: InvoicePaymentStatus;

    @Column({ type: 'text', nullable: true })
    revoked_reason!: string | null;

    @ManyToOne(() => UserEntity, { eager: false, onDelete: 'RESTRICT', nullable: true })
    @JoinColumn({ name: 'revoked_by_admin_id' })
    revoked_by_admin!: UserEntity | null;
    
    @Column({ name: 'revoked_by_admin_id', type: 'uuid', nullable: true })
    revoked_by_admin_id!: string | null;

    @CreateDateColumn()
    created_at!: Date;
    
    @UpdateDateColumn()
    updated_at!: Date;
}