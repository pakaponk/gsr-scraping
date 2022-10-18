import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCurrentUserReports(@Req() req) {
    const reports = await this.reportService.findAllByUserId(req.user.userId);

    return {
      reports,
    };
  }
}
