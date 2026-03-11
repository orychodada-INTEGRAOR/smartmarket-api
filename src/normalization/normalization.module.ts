import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NormalizationCacheService } from './normalization-cache.service';
import { TokenizerService } from './tokenizer.service';
import { BrandExtractorService } from './brand-extractor.service';
import { SizeExtractorService } from './size-extractor.service';
import { CategoryClassifierService } from './category-classifier.service';
import { NormalizationService } from './normalization.service';
import { ProductNormalizationService } from './product-normalization.service';

@Module({
  imports: [PrismaModule],
  providers: [
    NormalizationCacheService,
    TokenizerService,
    BrandExtractorService,
    SizeExtractorService,
    CategoryClassifierService,
    NormalizationService,
    ProductNormalizationService,
  ],
  exports: [
    NormalizationService,
    ProductNormalizationService,
  ],
})
export class NormalizationModule {}