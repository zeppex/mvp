import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

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
  
  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }
}
