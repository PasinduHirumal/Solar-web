import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "../enums/user.enum";

@Entity('users')
@Index('IDX_user_created_at_is_active',         ['created_at', 'is_active'])
@Index('IDX_user_created_at_is_active_role',    ['created_at', 'is_active', 'role',])
@Index('UQ_user_email',         ['email'],      { unique: true })
@Index('UQ_user_google_id',     ['google_id'],  { unique: true })
@Index('UQ_user_temp_token',    ['temp_token'], { unique: true })
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 255, select: false })
    password!: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role!: UserRole;

    @Column({ type: 'varchar', length: 255, nullable: true })
    google_id!: string | null;


    // system data
    @Column({ type: 'boolean', default: false })
    must_change_password!: boolean;

    @Column({ type: 'boolean', default: false })
    remember_me!: boolean;

    @Column({ type: 'boolean', default: false })
    is_anonymous!: boolean;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @Column({ type: 'int', default: 0, select: false })
    token_version!: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    temp_token!: string | null;

    @Column({ type: 'datetime', nullable: true })
    temp_token_expires!: Date | null;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}