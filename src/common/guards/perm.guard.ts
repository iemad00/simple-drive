import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole } from '../../roles/user-role.entity';
import { RolePermission } from '../../roles/role-permission.entity';

@Injectable()
export class PermGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const userId: string | undefined = req.user?.sub;
    if (!userId) throw new ForbiddenException('Not authenticated');

    const userRoleRepo = this.dataSource.getRepository(UserRole);
    const rolePermRepo = this.dataSource.getRepository(RolePermission);

    const links = await userRoleRepo.find({
      where: { userId },
      select: { roleId: true },
    });
    if (links.length === 0)
      throw new ForbiddenException('Insufficient permissions');

    const roleIds = links.map((l) => l.roleId);

    const rows = await rolePermRepo
      .createQueryBuilder('rp')
      .innerJoin('rp.permission', 'p')
      .where('rp.roleId IN (:...roleIds)', { roleIds })
      .select('p.name', 'name')
      .distinct(true)
      .getRawMany();

    const userPerms = new Set<string>(rows.map((r: any) => r.name));
    const hasAll = required.every((perm) => userPerms.has(perm));
    if (!hasAll) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
