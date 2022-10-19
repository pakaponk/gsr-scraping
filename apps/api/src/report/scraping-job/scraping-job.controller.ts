import type { BusboyFileStream } from '@fastify/busboy';
import type { MultipartFile } from '@fastify/multipart';
import { Controller, Post, Req, UseGuards } from '@nestjs/common';
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
}
