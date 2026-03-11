import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  async createList(familyId: string, name: string, createdById: string) {
    return this.prisma.shoppingList.create({
      data: { familyId, name, createdById },
    });
  }

  async addItem(listId: string, normalizedProductId: string, quantity: number) {
    return this.prisma.listItem.create({
      data: { listId, normalizedProductId, quantity },
    });
  }

  async updateItem(itemId: string, data: any) {
    return this.prisma.listItem.update({
      where: { id: itemId },
      data,
    });
  }
}