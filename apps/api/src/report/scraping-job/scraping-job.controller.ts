import type { BusboyFileStream } from '@fastify/busboy';
import type { MultipartFile } from '@fastify/multipart';
import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as Papa from 'papaparse';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ScrapingJobService } from './scraping-job.service';

@Controller('scrapingJobs')
export class ScrapingJobController {
  constructor(private readonly scrapingJobService: ScrapingJobService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  async uploadKeywords(@Req() req) {
    const file: MultipartFile = await req.file();

    const keywords = await this.getKeywordFromCsv(file.file);

    const scrapingJob = await this.scrapingJobService.createFromKeywords({
      filename: file.filename,
      keywords,
      userId: req.user.userId,
    });

    await this.scrapingJobService.addJobToQueue(scrapingJob);

    return {
      scrapingJob,
    };
  }

  private async getKeywordFromCsv(file: BusboyFileStream): Promise<string[]> {
    return new Promise((resolve, reject) => {
      Papa.parse<[string]>(file, {
        complete: async (result) => {
          resolve(result.data.map(([keyword]) => keyword));
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getScrapingJob(@Req() req, @Param('id') id: string) {
    const scrapingJob = await this.scrapingJobService.findById(id);

    if (req.user.userId !== scrapingJob.userId) {
      throw new ForbiddenException();
    }

    return {
      scrapingJob,
    };
  }
}
