import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma.service';
import { reportBuilder, userBuilder } from '../../test/utils/mock';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

describe('ReportController', () => {
  let controller: ReportController;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [ReportService, PrismaService],
    }).compile();

    controller = module.get<ReportController>(ReportController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('GET /reports', () => {
    it('return all reports of the current users', async () => {
      const mockUsers = Array.from({ length: 2 }, () => {
        return userBuilder();
      });
      const [mockCurrentUser] = mockUsers;

      const mockReports = mockUsers.flatMap((user) => {
        return Array.from({ length: 2 }, () => {
          return reportBuilder({
            overrides: {
              userId: user.id,
            },
          });
        });
      });

      await prisma.user.createMany({
        data: mockUsers,
      });
      await prisma.report.createMany({
        data: mockReports,
      });

      const mockRequest = {
        user: { userId: mockCurrentUser.id },
      };
      const { reports } = await controller.getCurrentUserReports(mockRequest);

      const expectedReports = mockReports
        .filter((report) => report.userId === mockCurrentUser.id)
        .map(({ html, ...rest }) => rest);
      expect(reports).toEqual(expectedReports);
    });
  });

  afterEach(async () => {
    const deleteUsers = prisma.user.deleteMany();
    const deleteReports = prisma.report.deleteMany();

    await prisma.$transaction([deleteReports, deleteUsers]);
  });
});
