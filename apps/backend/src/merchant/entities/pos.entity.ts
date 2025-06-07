import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  ManyToOne,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Branch } from './branch.entity';

@Entity('pos')
export class Pos {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => Branch, (branch) => branch.pos, { onDelete: 'CASCADE' })
  branch: Branch;

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }
}
