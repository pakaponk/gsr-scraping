import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { PrismaService } from '../prisma.service';
import { ScrapingJobService } from './scraping-job/scraping-job.service';
import { ScrapingJobController } from './scraping-job/scraping-job.controller';

@Module({
  controllers: [ReportController, ScrapingJobController],
  providers: [ReportService, PrismaService, ScrapingJobService],
})
export class ReportModule {}
