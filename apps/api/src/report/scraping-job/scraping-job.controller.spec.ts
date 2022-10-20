import * as fs from 'fs';
import * as path from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { ScrapingJobController } from './scraping-job.controller';
import { ScrapingJobService } from './scraping-job.service';
import { PrismaService } from '../../prisma.service';
import { userBuilder } from '../../../test/utils/mock';
import { ReportStatus } from '@prisma/client';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../config/configuration';
import { Queue } from 'bull';

const mockUser = userBuilder();

function reqBuilder(overrides: Record<string, any> = {}) {
  return {
    user: {
      userId: mockUser.id,
      email: mockUser.email,
    },
    ...overrides,
  };
}

describe('ScrapingJobController', () => {
  let controller: ScrapingJobController;
  let prisma: PrismaService;
  let queue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
        BullModule.registerQueue({
          name: 'scraping',
        }),
      ],
      controllers: [ScrapingJobController],
      providers: [ScrapingJobService, PrismaService, ConfigService],
    }).compile();

    controller = module.get<ScrapingJobController>(ScrapingJobController);
    prisma = module.get<PrismaService>(PrismaService);
    queue = module.get<Queue>(getQueueToken('scraping'));

    await prisma.user.create({
      data: mockUser,
    });
  });

  describe('POST /scrapingJobs/upload', () => {
    it('create a scraping job and a list of of pending reports', async () => {
      const testFilename = 'valid.csv';
      const testFilePath = path.join(__dirname + '/test', testFilename);
      const mockReq = reqBuilder({
        file: () => {
          return {
            filename: testFilename,
            file: fs.createReadStream(testFilePath),
          };
        },
      });

      const keywords = await new Promise<string[]>((resolve, reject) => {
        fs.readFile(testFilePath, (err, data) => {
          if (err) reject(err);
          resolve(data.toString().split('\n'));
        });
      });

      const { scrapingJob } = await controller.uploadKeywords(mockReq);

      // Assert that ScrapingJob is created
      expect(scrapingJob).toEqual({
        id: expect.any(String),
        userId: mockUser.id,
        filename: testFilename,
        totalKeywords: keywords.length,
        totalScrapedKeywords: 0,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // Assert that a list of pending reports is created
      const createdReports = await prisma.report.findMany({
        where: {
          scrapingJobId: scrapingJob.id,
        },
      });
      createdReports.forEach((report) => {
        expect(report).toEqual({
          id: expect.any(String),
          userId: mockUser.id,
          scrapingJobId: scrapingJob.id,
          status: ReportStatus.PENDING,
          keyword: expect.any(String),
          totalAdwords: null,
          totalLinks: null,
          totalSearchResults: null,
          html: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
      expect(createdReports.map(({ keyword }) => keyword)).toEqual(keywords);
    });
    it('add scrape jobs to queue (Max Attempt: 3, Timeout: 1 minute, Remove on complete)', async () => {
      const testFilename = 'valid.csv';
      const testFilePath = path.join(__dirname + '/test', testFilename);
      const mockReq = reqBuilder({
        file: () => {
          return {
            filename: testFilename,
            file: fs.createReadStream(testFilePath),
          };
        },
      });

      const { scrapingJob } = await controller.uploadKeywords(mockReq);

      const createdReports = await prisma.report.findMany({
        where: {
          scrapingJobId: scrapingJob.id,
        },
      });

      const jobs = (
        await Promise.all(
          createdReports.map((report) => queue.getJob(report.id)),
        )
      ).filter((job) => job !== null);

      const ONE_MINUTE_IN_MS = 60 * 1000;
      createdReports.forEach((report, index) => {
        const job = jobs[index];
        expect(job.opts).toMatchObject({
          attempts: 3,
          timeout: ONE_MINUTE_IN_MS,
          removeOnComplete: true,
        });
        expect(job.data).toEqual({
          reportId: report.id,
          keyword: report.keyword,
          scrapingJobId: report.scrapingJobId,
        });
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
