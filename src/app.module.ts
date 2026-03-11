import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';

// Core
import { PrismaModule } from './prisma/prisma.module';

// Engines
import { ProductsModule } from './products/products.module';
import { NormalizationModule } from './normalization/normalization.module';
import { MeilisearchModule } from './search/meilisearch.module';
import { GovImportModule } from './gov-import/gov-import.module';
import { ProductMatchingModule } from './product-matching/product-matching.module';

// Features
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FamilyModule } from './family/family.module';
import { ListsModule } from './lists/lists.module';
import { BasketModule } from './basket/basket.module';
import { AdminModule } from './admin/admin.module';

// Security
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    // הגדרה נקייה - ללא Redis, משתמש בזיכרון המקומי
    CacheModule.register({
      isGlobal: true,
      ttl: 60,
    }),

    PrismaModule,
    ProductsModule,
    NormalizationModule,
    MeilisearchModule,
    ProductMatchingModule,
    GovImportModule,

    UsersModule,
    AuthModule,
    FamilyModule,
    ListsModule,
    BasketModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}