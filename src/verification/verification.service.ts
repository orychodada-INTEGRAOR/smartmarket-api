import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VerificationService {
  constructor(private prisma: PrismaService) {}

  async verifyReport(reportId: number) {
    const report = await this.prisma.priceReport.findUnique({
      where: { id: reportId },
    });

    if (!report) throw new Error('Report not found');

    const ocrPrice = await this.fakeOCR(report.imageUrl);

    const isMatching =
      ocrPrice !== null &&
      Number(report.reportedPrice) === Number(ocrPrice);

    const status = isMatching ? 'APPROVED' : 'REJECTED';

    await this.prisma.priceReport.update({
      where: { id: reportId },
      data: {
        verified: isMatching,
        status,
        ocrText: ocrPrice?.toString() ?? null,
      },
    });

    if (isMatching) {
      await this.updatePrice(report);
    }

    return { status, ocrPrice };
  }

  async fakeOCR(imageUrl?: string | null): Promise<number | null> {
    if (!imageUrl) return null;
    return 12.90; // OCR דמה
  }

  async updatePrice(report: any) {
    await this.prisma.price.upsert({
      where: {
        productId_storeId: {
          productId: report.productId,
          storeId: report.storeId,
        },
      },
      update: {
        price: report.reportedPrice,
        validFrom: new Date(),
      },
      create: {
        productId: report.productId,
        storeId: report.storeId,
        price: report.reportedPrice,
      },
    });
  }
}