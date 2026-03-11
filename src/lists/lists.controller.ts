import { Controller, Post, Patch, Body } from '@nestjs/common';
import { ListsService } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private lists: ListsService) {}

  @Post('create')
  create(@Body() body: any) {
    return this.lists.createList(body.familyId, body.name, body.createdById);
  }

  @Post('add-item')
  addItem(@Body() body: any) {
    return this.lists.addItem(body.listId, body.normalizedProductId, body.quantity);
  }

  @Patch('update-item')
  updateItem(@Body() body: any) {
    return this.lists.updateItem(body.itemId, body);
  }
}