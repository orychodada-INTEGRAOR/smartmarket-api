// src/chains/chains.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChainDto } from './dto/create-chain.dto';

@Injectable()
export class ChainsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateChainDto) {
    // עכשיו ל-Chain יש id מסוג string, ולכן חייבים לספק אותו
    return this.prisma.chain.create({
      data: {
        id: data.id,
        name: data.name,
      },
    });
  }

  findAll() {
    return this.prisma.chain.findMany();
  }

  findOne(id: string) {
    return this.prisma.chain.findUnique({
      where: { id },
    });
  }

  update(id: string, data: Partial<CreateChainDto>) {
    return this.prisma.chain.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.chain.delete({
      where: { id },
    });
  }
}