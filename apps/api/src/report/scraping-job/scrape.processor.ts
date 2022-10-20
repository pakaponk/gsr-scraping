import { HttpService } from '@nestjs/axios';
import { Processor, Process } from '@nestjs/bull';
import { ReportStatus } from '@prisma/client';
import { Job } from 'bull';
import { PrismaService } from '../../prisma.service';
import { ScrapingJobPayload } from './types';
import {
  encodeGoogleSearchQuery,
  getGoogleSearchResultData,
  randomUserAgent,
} from './utils';

@Processor('scraping')
export class ScrapeProcessor {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  @Process()
  async scrape(job: Job<ScrapingJobPayload>) {
    const { reportId, keyword, scrapingJobId } = job.data;
    const userAgent = randomUserAgent();

    const query = encodeGoogleSearchQuery(keyword);

    const res = await this.httpService.axiosRef.get(
      `https://www.google.com/search?q=${query}&gl=us&hl=en`,
      {
        headers: {
          'User-Agent': userAgent,
        },
      },
    );
    const html = res.data;

    const { totalAdwords, totalLinks, totalSearchResults } =
      getGoogleSearchResultData(html);

    await this.prisma.$transaction([
      this.prisma.report.update({
        where: {
          id: reportId,
        },
        data: {
          status: ReportStatus.SUCCESS,
          totalAdwords,
          totalLinks,
          totalSearchResults,
          html,
        },
      }),
      this.prisma.scrapingJob.update({
        where: {
          id: scrapingJobId,
        },
        data: {
          totalScrapedKeywords: {
            increment: 1,
          },
        },
      }),
    ]);
  }
}
