import { Controller, Post, Body } from '@nestjs/common';
import { FamilyService } from './family.service';

@Controller('family')
export class FamilyController {
  constructor(private family: FamilyService) {}

  @Post('create')
  create(@Body() body: any) {
    return this.family.createFamily(body.ownerId, body.name);
  }

  @Post('join')
  join(@Body() body: any) {
    return this.family.joinFamily(body.userId, body.familyId);
  }
}