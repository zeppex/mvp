import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToOne,
  OneToMany,
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

  @ManyToOne(() => Merchant, (merchant) => merchant.branches)
  merchant: Merchant;

  @OneToMany(() => Pos, (pos) => pos.branch)
  pos: Pos[];

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }
}
