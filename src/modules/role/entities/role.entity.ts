import { User } from '@modules/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'varchar', length: 50 })
  name: string; // 'admin', 'author', 'reader'

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
