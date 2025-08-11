import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('blobs')
export class Blob {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column()
  ownerId: string;

  @ManyToOne(() => User, (u) => u.blobs, { onDelete: 'CASCADE' })
  owner: User;

  @Column({ type: 'int' })
  size: number;

  @Column()
  backend: string; // 'fs' | 'db' | 's3' | 'ftp'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
