import { Module } from '@nestjs/common';
import { PriceReportsService } from './price-reports.service';
import { PriceReportsController } from './price-reports.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { VerificationModule } from '../verification/verification.module';

@Module({
  imports: [PrismaModule, VerificationModule],
  controllers: [PriceReportsController],
  providers: [PriceReportsService],
})
export class PriceReportsModule {}