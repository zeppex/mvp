import { Entity, Column, PrimaryColumn, BeforeInsert, OneToMany } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Branch } from './branch.entity';

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

  @OneToMany(() => Branch, branch => branch.merchant, { cascade: true })
  branches: Branch[];

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }
}
