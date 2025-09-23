import { Controller, Post, UploadedFile, UseInterceptors, Body, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly svc: CandidatesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('excel', { storage: memoryStorage() }))
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: CreateCandidateDto
  ) {
    return this.svc.parseExcelAndCombine(file?.buffer, dto);
  }

  // Solo para demo/evaluación:
  @Get()
  async list() {
    return this.svc.listAllFromDb();
  }
}
