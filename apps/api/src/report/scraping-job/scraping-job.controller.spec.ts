import * as fs from 'fs';
import * as path from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { ScrapingJobController } from './scraping-job.controller';
import { ScrapingJobService } from './scraping-job.service';
import { PrismaService } from '../../prisma.service';
import { userBuilder } from '../../../test/utils/mock';
import { ReportStatus } from '@prisma/client';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScrapingJobController],
      providers: [ScrapingJobService, PrismaService],
    }).compile();

    controller = module.get<ScrapingJobController>(ScrapingJobController);
    prisma = module.get<PrismaService>(PrismaService);

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
  });

  afterEach(async () => {
    const deleteUsers = prisma.user.deleteMany();
    const deleteScrapingJobs = prisma.scrapingJob.deleteMany();
    const deleteReports = prisma.report.deleteMany();

    await prisma.$transaction([deleteScrapingJobs, deleteReports, deleteUsers]);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
