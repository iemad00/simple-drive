import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from './role.entity';

@Entity('user_roles')
export class UserRole {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  roleId: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => User, (u) => u.roles, { onDelete: 'CASCADE' })
  user: User;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => Role, (r) => r.userRoles, { onDelete: 'CASCADE' })
  role: Role;
}
