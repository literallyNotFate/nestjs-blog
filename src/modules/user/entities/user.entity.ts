import { BaseEntity } from '@common/entities';
import { Comment } from '@modules/comment/entities/comment.entity';
import { Post } from '@modules/post/entities/post.entity';
import { Role } from '@modules/role/entities/role.entity';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @ManyToOne(() => Role, (role) => role.users, { nullable: false })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];
}
