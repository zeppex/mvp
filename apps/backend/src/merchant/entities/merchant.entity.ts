import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  OneToMany,
  ManyToOne,
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

  @ManyToOne(() => Tenant, { nullable: false })
  tenant: Tenant;

  @OneToMany(() => Branch, (branch) => branch.merchant, { cascade: true })
  branches: Branch[];

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }
}
