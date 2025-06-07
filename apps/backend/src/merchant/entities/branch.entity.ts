import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Merchant } from './merchant.entity';
import { Pos } from './pos.entity';

@Entity('branches')
export class Branch {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  contactName: string;

  @Column()
  contactPhone: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Merchant, (merchant) => merchant.branches)
  merchant: Merchant;

  @OneToMany(() => Pos, (pos) => pos.branch)
  pos: Pos[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }
}
