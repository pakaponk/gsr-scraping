import { ForbiddenException, NotFoundException } from '@nestjs/common';
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

  describe('GET /reports/:id', () => {
    it('should return the specified report', async () => {
      const mockCurrentUser = userBuilder();

      const mockReport = reportBuilder({
        overrides: {
          userId: mockCurrentUser.id,
        },
      });

      await prisma.user.create({
        data: mockCurrentUser,
      });
      await prisma.report.create({
        data: mockReport,
      });

      const mockRequest = {
        user: { userId: mockCurrentUser.id },
      };
      const { report } = await controller.getCurrentUserReport(
        mockRequest,
        mockReport.id,
      );

      expect(report).toEqual(mockReport);
    });
    it('should return 403 Forbidden when the current user does not own the specified report', async () => {
      const mockUsers = [userBuilder(), userBuilder()];
      const [mockCurrentUser, mockAnotherUser] = mockUsers;

      const mockReport = reportBuilder({
        overrides: {
          userId: mockCurrentUser.id,
        },
      });

      await prisma.user.createMany({
        data: mockUsers,
      });
      await prisma.report.create({
        data: mockReport,
      });

      const mockRequest = {
        user: { userId: mockAnotherUser.id },
      };
      await expect(
        controller.getCurrentUserReport(mockRequest, mockReport.id),
      ).rejects.toThrowError(ForbiddenException);
    });
    it('should return 404 Not Found when the specified report does not existed', async () => {
      const mockCurrentUser = userBuilder();
      await prisma.user.createMany({
        data: mockCurrentUser,
      });

      const mockRequest = {
        user: { userId: mockCurrentUser.id },
      };
      await expect(
        controller.getCurrentUserReport(mockRequest, 'NOT_EXISTED'),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  afterEach(async () => {
    const deleteUsers = prisma.user.deleteMany();
    const deleteReports = prisma.report.deleteMany();

    await prisma.$transaction([deleteReports, deleteUsers]);
  });
});
