import { Entity, ManyToOne, PrimaryColumn, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from './role.entity';

@Entity('user_roles')
@Index(['userId', 'roleId'], { unique: true })
export class UserRole {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('int')
  roleId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Role;
}
