import { Injectable, NotFoundException } from '@nestjs/common';
import { NotFoundError } from '@prisma/client/runtime';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async findAllByUserIdAndKeyword(userId: string, keyword?: string) {
    const keywordWhere =
      keyword ?? ''
        ? {
            keyword: {
              search: keyword,
            },
          }
        : {};

    return this.prisma.report.findMany({
      where: {
        userId,
        ...keywordWhere,
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

  async findById(id: string) {
    try {
      return await this.prisma.report.findUniqueOrThrow({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundError) throw new NotFoundException();
      else throw error;
    }
  }
}
