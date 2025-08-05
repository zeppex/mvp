import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Merchant } from '../../core/entities/merchant.entity';
import { Branch } from '../../core/entities/branch.entity';
import { Pos } from '../../core/entities/pos.entity';

export enum UserRole {
  SUPERADMIN = 'superadmin', // Platform super admin - can create merchants
  ADMIN = 'admin', // Merchant admin - can manage entire merchant
  BRANCH_ADMIN = 'branch_admin', // Branch admin - can manage specific branch
  CASHIER = 'cashier', // POS user - can only create payment orders for specific PoS
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CASHIER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  // For SUPERADMIN: both merchant and branch will be null
  // For ADMIN: merchant will be set, branch will be null
  // For BRANCH_ADMIN and CASHIER: both merchant and branch will be set
  @ManyToOne(() => Merchant, { nullable: true })
  merchant: Merchant;

  @ManyToOne(() => Branch, { nullable: true })
  branch: Branch;

  // For CASHIER: specific POS they can operate
  @ManyToOne(() => Pos, { nullable: true })
  pos: Pos;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
