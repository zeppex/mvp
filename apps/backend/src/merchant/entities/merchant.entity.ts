import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Branch } from './branch.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('merchants')
export class Merchant {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  contact: string;

  @Column()
  contactName: string;

  @Column()
  contactPhone: string;

  @Column({ nullable: true })
  binanceId: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Tenant, { nullable: false })
  tenant: Tenant;

  @OneToMany(() => Branch, (branch) => branch.merchant, { cascade: true })
  branches: Branch[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }
}
