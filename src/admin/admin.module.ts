import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from './roles.guard';
import { APP_GUARD, Reflector } from '@nestjs/core';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    PrismaService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AdminModule {}