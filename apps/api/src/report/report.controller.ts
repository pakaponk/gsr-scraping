import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCurrentUserReports(
    @Req() req,
    @Query('keyword') keyword: string | undefined,
  ) {
    const reports = await this.reportService.findAllByUserIdAndKeyword(
      req.user.userId,
      keyword,
    );

    return {
      reports,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getCurrentUserReport(@Req() req, @Param('id') id: string) {
    const report = await this.reportService.findById(id);

    if (req.user.userId !== report.userId) {
      throw new ForbiddenException();
    }

    return {
      report,
    };
  }
}
