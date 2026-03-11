// src/products/products.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ⭐ create שחסרה
  create(data: any) {
    return this.prisma.product.create({
      data: {
        id: data.id,
        barcode: data.barcode,
        name: data.name,
        manufacturer: data.manufacturer,
        unitQty: data.unitQty,
        unitOfMeasure: data.unitOfMeasure,
        category: data.category,
      },
    });
  }

  findAll() {
    return this.prisma.product.findMany();
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  update(id: string, data: any) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}