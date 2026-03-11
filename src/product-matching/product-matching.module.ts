import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SimilarityService } from './similarity.service';
import { ClusteringService } from './clustering.service';
import { ProductMatchingService } from '../product-matching/product-matching.service';

@Module({
  imports: [PrismaModule],
  providers: [
    SimilarityService,
    ClusteringService,
    ProductMatchingService,
  ],
  exports: [
    SimilarityService,
    ClusteringService,
    ProductMatchingService,
  ],
})
export class ProductMatchingModule {}