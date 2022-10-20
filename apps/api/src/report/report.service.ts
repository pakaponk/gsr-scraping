import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async findAllByUserId(userId: string) {
    return this.prisma.report.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        scrapingJobId: true,
        keyword: true,
        status: true,
        totalAdwords: true,
        totalLinks: true,
        totalSearchResults: true,
        html: false,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
