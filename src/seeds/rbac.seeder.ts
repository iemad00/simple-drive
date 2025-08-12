import { DataSource } from 'typeorm';
import { Role } from '../roles/role.entity';
import { Permission } from '../permissions/permission.entity';
import { RolePermission } from '../roles/role-permission.entity';
import { User } from '../users/user.entity';
import { UserRole } from '../roles/user-role.entity';

export async function seedRbac(ds: DataSource) {
  const roleRepo = ds.getRepository(Role);
  const permRepo = ds.getRepository(Permission);
  const rolePermRepo = ds.getRepository(RolePermission);
  const userRepo = ds.getRepository(User);
  const userRoleRepo = ds.getRepository(UserRole);

  let backendMgr = await roleRepo.findOne({
    where: { name: 'BackendManager' },
  });
  if (!backendMgr)
    backendMgr = await roleRepo.save(
      roleRepo.create({ name: 'BackendManager' }),
    );

  const permNames = ['backend:update', 'backend:read'];
  const perms: Permission[] = [];
  for (const name of permNames) {
    let p = await permRepo.findOne({ where: { name } });
    if (!p) p = await permRepo.save(permRepo.create({ name }));
    perms.push(p);
  }

  for (const p of perms) {
    const exists = await rolePermRepo.findOne({
      where: { roleId: backendMgr.id, permissionId: p.id },
    });
    if (!exists)
      await rolePermRepo.save(
        rolePermRepo.create({ roleId: backendMgr.id, permissionId: p.id }),
      );
  }

  let user = await userRepo.findOne({ where: { phone: '0542306039' } });
  if (!user)
    user = await userRepo.save(userRepo.create({ phone: '0542306039' }));

  const link = await userRoleRepo.findOne({
    where: { userId: user.id, roleId: backendMgr.id },
  });
  if (!link)
    await userRoleRepo.save(
      userRoleRepo.create({ userId: user.id, roleId: backendMgr.id }),
    );

  console.log('BackendManager + permissions seeded and assigned to 0542306039');
}
