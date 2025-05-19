import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pos } from '../pos/pos.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal')
  amount: number;

  @Column()
  description: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed' | 'failed';

  @ManyToOne(() => Pos, (pos) => pos.orders, { nullable: true })
  pos: Pos;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
