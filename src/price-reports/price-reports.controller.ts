import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { PriceReportsService } from './price-reports.service';
import { CreatePriceReportDto } from './dto/create-price-report.dto';
import { UpdatePriceReportDto } from './dto/update-price-report.dto';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller('price-reports')
export class PriceReportsController {
  constructor(private readonly priceReportsService: PriceReportsService) {}

  @Post()
  create(@Body() dto: CreatePriceReportDto) {
    return this.priceReportsService.create(dto);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'price-reports'),
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = extname(file.originalname);
          callback(null, uniqueName + extension);
        },
      }),
    }),
  )
  uploadImage(@UploadedFile() file: any) {
    const imageUrl = `/uploads/price-reports/${file.filename}`;
    return { imageUrl };
  }

  @Get()
  findAll() {
    return this.priceReportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.priceReportsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePriceReportDto) {
    return this.priceReportsService.update(+id, dto);
  }

  @Put(':id/verify')
  verify(@Param('id') id: string) {
    return this.priceReportsService.approveReport(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.priceReportsService.remove(+id);
  }
}