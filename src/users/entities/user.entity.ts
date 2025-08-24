import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Grade } from '../constants/grade.enum';
import { Post } from 'src/posts/entities/post.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  // 기본 조회에서 제외
  @Column({ select: false })
  password: string;

  @Column({ unique: true })
  nickname: string;

  @Column({
    type: 'enum',
    enum: Grade,
    default: Grade.Seedling,
  })
  grade: Grade;

  @Column({ default: 0 })
  points: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ nullable: true })
  profileUrl: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}
