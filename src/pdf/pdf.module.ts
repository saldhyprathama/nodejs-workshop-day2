import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';

/**
 * 🏗 PdfModule
 * Wraps everything PDF-related. PrismaService is injected via the global PrismaModule.
 */
@Module({
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule {}
