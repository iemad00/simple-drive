import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blob } from '../blobs/blob.entity';
import { UserRole } from '../roles/user-role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phone: string;

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => UserRole, (ur) => ur.user, { cascade: true })
  roles: UserRole[];

  @OneToMany(() => Blob, (b) => b.owner)
  blobs: Blob[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
