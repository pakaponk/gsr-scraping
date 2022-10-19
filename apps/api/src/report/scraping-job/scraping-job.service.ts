import { Prisma, ReportStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ScrapingJobService {
  constructor(private prisma: PrismaService) {}

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
}
