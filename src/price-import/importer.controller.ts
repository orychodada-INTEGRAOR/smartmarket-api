import { Controller, Get } from '@nestjs/common';
import { ImporterService } from './importer.service';

@Controller('import')
export class ImporterController {
  constructor(private importer: ImporterService) {}

  @Get('run')
  async run() {
    return this.importer.runImport();
  }
}