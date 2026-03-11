// src/price-reports/price-reports.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PriceReportsService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.priceReport.create({ data });
  }

  findAll() {
    return this.prisma.priceReport.findMany();
  }

  findOne(id: number) {
    return this.prisma.priceReport.findUnique({
      where: { id },
    });
  }

  update(id: number, data: any) {
    return this.prisma.priceReport.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.priceReport.delete({
      where: { id },
    });
  }

  // ⭐ הפונקציה שחסרה:
  approveReport(id: number) {
    return this.prisma.priceReport.update({
      where: { id },
      data: { verified: true, status: 'APPROVED' },
    });
  }
}