import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from './role.entity';

@Entity('user_roles')
export class UserRole {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  roleId: number;

  @ManyToOne(() => User, (u) => u.roles, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Role, (r) => r.userRoles, { onDelete: 'CASCADE' })
  role: Role;
}
