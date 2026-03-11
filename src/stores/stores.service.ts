// src/stores/stores.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateStoreDto) {
    return this.prisma.store.create({
      data: {
        id: data.id,
        name: data.name,
        chainId: data.chainId,
        city: data.city,
        address: data.address,
      },
    });
  }

  findAll() {
    return this.prisma.store.findMany();
  }

  findOne(id: string) {
    return this.prisma.store.findUnique({
      where: { id },
    });
  }

  update(id: string, data: UpdateStoreDto) {
    return this.prisma.store.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.store.delete({
      where: { id },
    });
  }
}