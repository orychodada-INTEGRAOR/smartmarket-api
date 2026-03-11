import { Module } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [
    SearchService,
    {
      provide: 'MEILISEARCH_CLIENT',
      useFactory: () => {
        return new MeiliSearch({
          host: 'http://localhost:7700',
          apiKey: 'MASTER_KEY',
        });
      },
    },
  ],
  exports: [SearchService],
})
export class MeilisearchModule {}