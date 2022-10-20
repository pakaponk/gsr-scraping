import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma.service';
import {
  reportBuilder,
  scrapingJobBuilder,
  userBuilder,
} from '../../../test/utils/mock';
import { ScrapeProcessor } from './scrape.processor';
import { HttpModule, HttpService } from '@nestjs/axios';
import * as utils from './utils';
import { ScrapingJobPayload } from './types';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { ReportStatus } from '@prisma/client';

jest.mock('./utils');

const mockUser = userBuilder();
const mockScrapingJob = scrapingJobBuilder({
  overrides: {
    userId: mockUser.id,
  },
});
const mockReport = reportBuilder({
  overrides: {
    userId: mockUser.id,
    scrapingJobId: mockScrapingJob.id,
  },
});
const mockGetRequest = jest.fn();

describe('ScrapingJobController', () => {
  let processor: ScrapeProcessor;
  let prisma: PrismaService;
  let queue: Queue<ScrapingJobPayload>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        BullModule.registerQueue({
          name: 'testing',
        }),
      ],
      providers: [ScrapeProcessor, PrismaService],
    })
      .overrideProvider(HttpService)
      .useValue({
        axiosRef: {
          get: mockGetRequest,
        },
      })
      .compile();

    processor = module.get<ScrapeProcessor>(ScrapeProcessor);
    prisma = module.get<PrismaService>(PrismaService);
    queue = module.get<Queue<ScrapingJobPayload>>(getQueueToken('testing'));
  });

  beforeEach(async () => {
    await prisma.user.create({
      data: mockUser,
    });
    await prisma.scrapingJob.create({ data: mockScrapingJob });
    await prisma.report.create({ data: mockReport });
  });

  describe('ScrapeProcessor', () => {
    it('should save the result to the associated report', async () => {
      // Mock Get Request to Google
      const mockHtml = 'Some HTML code';
      mockGetRequest.mockReturnValue({ data: mockHtml });

      // Mock the result of we extracted from HTML
      const mockResult = {
        totalAdwords: 10,
        totalLinks: 100,
        totalSearchResults: BigInt(1000),
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      utils.getGoogleSearchResultData.mockReturnValue(mockResult);

      const mockJob = await queue.add(
        {
          scrapingJobId: mockScrapingJob.id,
          reportId: mockReport.id,
          keyword: mockReport.keyword,
        },
        {
          jobId: mockReport.id,
        },
      );

      await processor.scrape(mockJob);

      const updatedReport = await prisma.report.findUnique({
        where: { id: mockReport.id },
      });

      expect(updatedReport).toEqual({
        ...mockReport,
        status: ReportStatus.SUCCESS,
        totalLinks: mockResult.totalLinks,
        totalAdwords: mockResult.totalAdwords,
        totalSearchResults: mockResult.totalSearchResults,
        html: mockHtml,
        updatedAt: expect.any(Date),
      });
    });
    it('should update the scraping job progress', async () => {
      // Mock Get Request to Google
      const mockHtml = 'Some HTML code';
      mockGetRequest.mockReturnValue({ data: mockHtml });

      // Mock the result of we extracted from HTML
      const mockResult = {
        totalAdwords: 10,
        totalLinks: 100,
        totalSearchResults: BigInt(1000),
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      utils.getGoogleSearchResultData.mockReturnValue(mockResult);

      const mockJob = await queue.add(
        {
          scrapingJobId: mockScrapingJob.id,
          reportId: mockReport.id,
          keyword: mockReport.keyword,
        },
        {
          jobId: mockReport.id,
        },
      );

      await processor.scrape(mockJob);

      const updatedScrapingJob = await prisma.scrapingJob.findUnique({
        where: { id: mockScrapingJob.id },
      });

      expect(updatedScrapingJob).toEqual({
        ...mockScrapingJob,
        totalScrapedKeywords: 1,
        updatedAt: expect.any(Date),
      });
    });
  });

  afterEach(async () => {
    const deleteUsers = prisma.user.deleteMany();
    const deleteScrapingJobs = prisma.scrapingJob.deleteMany();
    const deleteReports = prisma.report.deleteMany();

    await prisma.$transaction([deleteScrapingJobs, deleteReports, deleteUsers]);
    await queue.empty();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
