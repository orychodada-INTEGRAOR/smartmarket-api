import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FamilyService {
  constructor(private prisma: PrismaService) {}

  async createFamily(ownerId: string, name: string) {
    return this.prisma.family.create({
      data: {
        name,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: 'owner',
          },
        },
      },
    });
  }

  async joinFamily(userId: string, familyId: string) {
    return this.prisma.familyMember.create({
      data: {
        userId,
        familyId,
        role: 'member',
      },
    });
  }
}