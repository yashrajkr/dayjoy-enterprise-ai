import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: QueryProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      tenant_id: tenantId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.categoryId) {
      where.category_id = query.categoryId;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, tenantId: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, include: { category: true } });
    if (!product || product.tenant_id !== tenantId) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async create(tenantId: string, dto: CreateProductDto) {
    const existing = await this.prisma.product.findFirst({
      where: { tenant_id: tenantId, sku: dto.sku },
    });
    if (existing) {
      throw new Error('Product with this SKU already exists');
    }

    const product = await this.prisma.product.create({
      data: {
        tenant_id: tenantId,
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        cost: dto.cost,
        currency: dto.currency ?? 'USD',
        inventory_count: dto.inventoryCount ?? 0,
        category_id: dto.categoryId,
        status: dto.status ?? 'ACTIVE',
      },
    });

    return product;
  }

  async update(id: string, tenantId: string, dto: UpdateProductDto) {
    const product = await this.findById(id, tenantId);

    const updated = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        cost: dto.cost,
        currency: dto.currency,
        inventory_count: dto.inventoryCount,
        category_id: dto.categoryId,
        status: dto.status as any,
      },
    });

    return updated;
  }

  async softDelete(id: string, tenantId: string) {
    const product = await this.findById(id, tenantId);

    await this.prisma.product.update({
      where: { id: product.id },
      data: { status: 'DELETED' as any },
    });

    return { success: true };
  }

  async listCategories(tenantId: string) {
    return this.prisma.productCategory.findMany({
      where: { tenant_id: tenantId },
      orderBy: { sort_order: 'asc' },
    });
  }
}
