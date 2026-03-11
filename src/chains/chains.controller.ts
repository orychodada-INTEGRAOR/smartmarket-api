// src/chains/chains.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ChainsService } from './chains.service';
import { CreateChainDto } from './dto/create-chain.dto';

@Controller('chains')
export class ChainsController {
  constructor(private readonly chainsService: ChainsService) {}

  @Post()
  create(@Body() dto: CreateChainDto) {
    return this.chainsService.create(dto);
  }

  @Get()
  findAll() {
    return this.chainsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chainsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateChainDto>) {
    return this.chainsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chainsService.remove(id);
  }
}