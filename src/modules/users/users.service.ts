import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../middleware/errorHandler';

export async function listUsers(tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.user.findMany({ where: { tenant_id: tenantId }, include: { userRoles: { include: { role: true } } }, skip, take: limit, orderBy: { created_at: 'desc' } }),
    prisma.user.count({ where: { tenant_id: tenantId } }),
  ]);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getUserById(id: string, tenantId: string) {
  const user = await prisma.user.findUnique({ where: { id }, include: { userRoles: { include: { role: true } } } });
  if (!user || user.tenant_id !== tenantId) throw new NotFoundError('User');
  return user;
}
