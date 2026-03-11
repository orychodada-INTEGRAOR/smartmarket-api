import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PriceComparisonService } from './price-comparison.service';
import { PriceComparisonController } from './price-comparison.controller';

@Module({
  controllers: [PriceComparisonController],
  providers: [PriceComparisonService, PrismaService],
  exports: [PriceComparisonService],
})
export class PriceComparisonModule {}