import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async list(@CurrentUser() user: any, @Query() query: QueryProductsDto) {
    return this.productsService.list(user.tenantId, query);
  }

  @Get('categories')
  async listCategories(@CurrentUser() user: any) {
    return this.productsService.listCategories(user.tenantId);
  }

  @Get(':id')
  async getById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.productsService.findById(id, user.tenantId);
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.tenantId, dto);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  async softDelete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.productsService.softDelete(id, user.tenantId);
  }
}
