import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { PrismaService } from '../prisma.service';
import { ScrapingJobService } from './scraping-job/scraping-job.service';
import { ScrapingJobController } from './scraping-job/scraping-job.controller';
import { ScrapeProcessor } from './scraping-job/scrape.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'scraping',
    }),
    HttpModule,
  ],
  controllers: [ReportController, ScrapingJobController],
  providers: [
    ReportService,
    PrismaService,
    ScrapingJobService,
    ScrapeProcessor,
  ],
})
export class ReportModule {}
