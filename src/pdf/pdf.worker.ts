/**
 * 🧵 Worker Thread — PDF Generation
 *
 * This file runs in a SEPARATE thread, isolated from the main event loop.
 * Heavy/blocking work (like PDF rendering) goes here so the main thread
 * stays responsive and can handle other HTTP requests.
 *
 * Communication flow:
 *   Main thread  →  workerData  →  Worker thread
 *   Worker thread →  parentPort.postMessage()  →  Main thread
 */
import { workerData, parentPort } from 'worker_threads';
import * as PDFDocument from 'pdfkit';

const { post } = workerData as {
  post: { id: number; title: string; body: string; author: { name: string } };
};

// Build PDF entirely in the worker — never blocks the main event loop
const doc = new PDFDocument({ margin: 50 });
const chunks: Buffer[] = [];

doc.on('data', (chunk: Buffer) => chunks.push(chunk));

doc.on('end', () => {
  const pdfBuffer = Buffer.concat(chunks);
  // Send the finished PDF back to the main thread as a Buffer
  parentPort?.postMessage({ pdfBuffer });
});

// ── Document layout ──────────────────────────────────────────────
doc.fontSize(24).font('Helvetica-Bold').text(post.title, { align: 'center' });

doc.moveDown(0.5);

doc
  .fontSize(11)
  .font('Helvetica')
  .fillColor('#666666')
  .text(`By ${post.author.name}`, { align: 'center' });

doc.moveDown(1);
doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
doc.moveDown(1);

doc
  .fontSize(13)
  .font('Helvetica')
  .fillColor('#333333')
  .text(post.body, { align: 'left', lineGap: 4 });

doc.moveDown(2);
doc
  .fontSize(9)
  .fillColor('#aaaaaa')
  .text(`Generated on ${new Date().toUTCString()} — Node.js Worker Thread`, {
    align: 'center',
  });

doc.end();
