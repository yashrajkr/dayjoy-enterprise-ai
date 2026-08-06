import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../middleware/errorHandler';

export async function listProducts(tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.product.findMany({ where: { tenant_id: tenantId }, include: { category: true }, skip, take: limit, orderBy: { name: 'asc' } }),
    prisma.product.count({ where: { tenant_id: tenantId } }),
  ]);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getProductById(id: string, tenantId: string) {
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!product || product.tenant_id !== tenantId) throw new NotFoundError('Product');
  return product;
}
