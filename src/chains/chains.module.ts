// src/chains/chains.module.ts
import { Module } from '@nestjs/common';
import { ChainsService } from './chains.service';
import { ChainsController } from './chains.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ChainsController],
  providers: [ChainsService, PrismaService],
  exports: [ChainsService],
})
export class ChainsModule {}