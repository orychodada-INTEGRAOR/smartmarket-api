import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('debug')
export class DebugController {
  constructor(private prisma: PrismaService) {}

  @Get('products')
  async products() {
    return this.prisma.product.count();
  }

  @Get('prices')
  async prices() {
    return this.prisma.price.count();
  }
}