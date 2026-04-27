import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pdf')
export class PdfController {
  constructor(private pdfService: PdfService) {}

  /**
   * GET /pdf/post/:id
   * Protected route — generates a PDF for a post using a Worker Thread.
   * The main thread is free to handle other requests while the PDF is built.
   */
  @Get('post/:id')
  @UseGuards(JwtAuthGuard)
  async generatePostPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const buffer = await this.pdfService.generatePostPdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="post-${id}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get('post/:id/blocking')
  @UseGuards(JwtAuthGuard)
  async generatePdfBlocking(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const buffer = await this.pdfService.generatePostPdfBlocking(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="post-${id}-blocking.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
