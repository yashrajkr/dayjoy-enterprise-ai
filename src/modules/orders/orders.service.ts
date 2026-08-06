import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateTotals(items: { quantity: number; unitPrice: number }[]) {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * 0.0; // placeholder: tax logic can be extended later
    const shipping = 0;
    const discount = 0;
    const total = subtotal + tax + shipping - discount;
    return { subtotal, tax, shipping, discount, total };
  }

  async list(tenantId: string, query: QueryOrdersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      tenant_id: tenantId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerId) {
      where.customer_id = query.customerId;
    }

    if (query.distributorId) {
      where.distributor_id = query.distributorId;
    }

    if (query.search) {
      where.order_number = { contains: query.search, mode: 'insensitive' };
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          customer: true,
          distributor: true,
          items: { include: { product: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, tenantId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        distributor: true,
        items: { include: { product: true } },
      },
    });
    if (!order || order.tenant_id !== tenantId) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async create(tenantId: string, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    const { subtotal, tax, shipping, discount, total } = this.calculateTotals(
      dto.items.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice })),
    );

    const orderNumber = `ORD-${Date.now()}`;

    const order = await this.prisma.order.create({
      data: {
        tenant_id: tenantId,
        customer_id: dto.customerId,
        distributor_id: dto.distributorId,
        order_number: orderNumber,
        status: 'PENDING',
        subtotal,
        tax,
        shipping,
        discount,
        total,
        currency: dto.currency ?? 'USD',
        items: {
          create: dto.items.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        customer: true,
        distributor: true,
        items: { include: { product: true } },
      },
    });

    return order;
  }

  async updateStatus(id: string, tenantId: string, dto: UpdateOrderStatusDto) {
    const order = await this.findById(id, tenantId);

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: { status: dto.status as any },
      include: {
        customer: true,
        distributor: true,
        items: { include: { product: true } },
      },
    });

    return updated;
  }

  async softDelete(id: string, tenantId: string) {
    const order = await this.findById(id, tenantId);

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' as any },
    });

    return { success: true, order: updated };
  }
}
