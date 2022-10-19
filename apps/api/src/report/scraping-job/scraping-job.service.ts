import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Prisma, ReportStatus, ScrapingJob } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { ScrapingJobPayload } from './types';

@Injectable()
export class ScrapingJobService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('scraping') private reportQueue: Queue<ScrapingJobPayload>,
  ) {}

  createFromKeywords({
    filename,
    keywords,
    userId,
  }: {
    filename: string;
    keywords: string[];
    userId: string;
  }) {
    const reports: Prisma.ReportCreateManyScrapingJobInput[] = keywords.map(
      (keyword) => ({
        userId,
        keyword,
        status: ReportStatus.PENDING,
      }),
    );

    return this.prisma.scrapingJob.create({
      data: {
        userId,
        filename,
        totalKeywords: keywords.length,
        reports: {
          createMany: {
            data: reports,
          },
        },
      },
    });
  }

  async addJobToQueue(scrapingJob: ScrapingJob) {
    const reports = await this.prisma.report.findMany({
      where: {
        scrapingJobId: scrapingJob.id,
      },
    });

    for (const report of reports) {
      this.reportQueue.add(
        { reportId: report.id, keyword: report.keyword },
        {
          jobId: report.id,
          attempts: 3,
          timeout: 1000 * 60,
          removeOnComplete: true,
        },
      );
    }
  }
}
